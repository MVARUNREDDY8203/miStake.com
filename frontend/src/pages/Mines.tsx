import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Modal from "../components/Modal";
import { useWalletStore } from "../stores/wallet";

enum TileState {
    UNREVEALED = 0,
    REVEALED = 1,
    LOADING = 2,
    CASHEDOUT = 3,
}
const HOUSE_EDGE: number = 0.99;
const N_TILES: number = 25;
const init_tile_array: number[] = new Array(N_TILES).fill(TileState.UNREVEALED);

export default function MinesPage() {
    const array: number[] = Array.from({ length: N_TILES }, (_, idx) => idx);
    const [manual, setManual] = useState<boolean>(true);
    const [gameOn, setGameOn] = useState<boolean>(false);
    const [numberOfMines, setNumberOfMines] = useState<number>(1);
    const [revealedState, setRevealedState] =
        useState<number[]>(init_tile_array); // 0 - not revealed , 1 - revealed, 2 - loading, 3 - cashedoutandunrevealed
    const [minesState, setMinesState] = useState<number[]>(init_tile_array);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [multiplier, setMultiplier] = useState<number>(1);
    const [winningMultiplier, setWinningMultipler] = useState<number>(0);
    const [bettingAmt, setBettingAmt] = useState<number>(0);
    const [finalWinnings, setFinalWinnings] = useState<number>(0);
    const { balance, addWinnings, placeBet } = useWalletStore();
    useEffect(() => {
        if (revealedState.includes(2)) return; // if state is loading wait till all the updation has happened
        calculateMultiplier();
    }, [revealedState]);
    function handleBettingAmt(e: React.ChangeEvent<HTMLInputElement>): void {
        e.preventDefault();
        let value: number = Number(e.target.value);
        if (value > balance) {
            alert("cant bet more than balance, top up or stfu");
            return;
        }
        setBettingAmt(() => value);
    }
    function calculateMultiplier(): void {
        let revealed: number = revealedState.filter(
            (v) => v == TileState.REVEALED
        ).length; // no of revealed tiles
        if (revealed == 0 || !gameOn) {
            setMultiplier(1);
            return;
        }
        let total_rem: number = revealedState.filter(
            (v) => v == TileState.UNREVEALED
        ).length; // unrevealed tiles
        let mines: number = numberOfMines;

        let curr_multiplier = 1;
        for (let i = 1; i <= revealed; i++) {
            curr_multiplier *= (total_rem + i) / (total_rem + i - mines);
        }
        curr_multiplier *= HOUSE_EDGE;
        // inverse probability of success * house edge

        setMultiplier(() => curr_multiplier);
    }
    function setMines(): void {
        let newMinesArray: number[] = new Array(25).fill(0);

        const indicesOfMines = new Set<number>();
        while (indicesOfMines.size < numberOfMines) {
            indicesOfMines.add(Math.floor(Math.random() * 25));
        }

        indicesOfMines.forEach((idx) => (newMinesArray[idx] = 1));
        setMinesState(newMinesArray);
    }
    function setRevealedStateTo(clickedIndex: number, state: number): void {
        setRevealedState((prev) => {
            let newRevealedState = [...prev];
            newRevealedState[clickedIndex] = state;
            return newRevealedState;
        });
    }
    function handleBet(): void {
        setRevealedState(() => init_tile_array);
        setIsModalOpen(false);
        setMines();
        if (bettingAmt > balance) {
            alert("you're broke pussy, go fill your wallets up again");
            return;
        }
        setGameOn(true);
        // deduct from balance
        placeBet(bettingAmt);

        new Audio("./bet.mp3").play();
    }
    function handleTileClick(clickedIndex: number): void {
        if (!gameOn) return;
        if (revealedState[clickedIndex] != TileState.UNREVEALED) return;

        setRevealedStateTo(clickedIndex, TileState.LOADING);

        if (minesState[clickedIndex] == 1) {
            setGameOn(false);
            // reveal after a small delay

            setTimeout(() => {
                setRevealedStateTo(clickedIndex, TileState.REVEALED);
                setRevealedState((prev) => {
                    let newRevealedState = [...prev];
                    newRevealedState.forEach((v, i) => {
                        if (v == 0) newRevealedState[i] = TileState.CASHEDOUT; // if unrevealed now set to state cashout reveal
                    });
                    return newRevealedState;
                });
                new Audio("./mineblast.mp3").play();
                setMultiplier(1);
            }, 500);
        } else {
            setTimeout(() => {
                setRevealedStateTo(clickedIndex, TileState.REVEALED);
                new Audio("./gemclink.mp3").play();
            }, 500);
        }
    }
    function handleCashOut() {
        // checking if atleast one tile has been clicked
        let flag: boolean = false;
        for (let i = 0; i < 25; i++)
            if (revealedState[i] == TileState.REVEALED) {
                flag = true;
                break;
            }
        if (!flag) {
            alert("select alteast one tile");
            return;
        }
        const winnings = multiplier * bettingAmt;
        setWinningMultipler(() => multiplier);
        // revealing all the untouched tiles
        setFinalWinnings(winnings);
        addWinnings(winnings);
        setRevealedState((prev) => {
            let newRevealedState = [...prev];
            newRevealedState.forEach((v, i) => {
                if (v == 0) newRevealedState[i] = TileState.CASHEDOUT;
            });
            return newRevealedState;
        });
        new Audio("./win.mp3").play();
        setIsModalOpen(true);
        setGameOn(false);
    }
    function handleRandomTilePick() {
        let clickable_subset_of_tiles: number[] = [];
        revealedState.forEach((v, i) => {
            if (v == TileState.UNREVEALED) {
                clickable_subset_of_tiles.push(i);
            }
        });
        let idx = Math.floor(Math.random() * clickable_subset_of_tiles.length);
        let idx_to_be_clicked = clickable_subset_of_tiles[idx];
        handleTileClick(idx_to_be_clicked);
    }
    return (
        <>
            <div
                id="mines-page"
                className="flex flex-1 flex-col items-center w-6xl overflow-y-scroll py-10 bg-stake-500 "
            >
                {/* game div */}
                <div id="gamediv" className="flex-1 bg-stake-500 rounded-lg">
                    <div
                        id="setting+game"
                        className="flex w-6xl bg-stake-300 rounded-lg"
                    >
                        {/* settings and bet buttons */}
                        <div
                            id="bet-setting"
                            className="flex flex-col items-center py-3 w-2xs rounded-l-2xl gap-2"
                        >
                            {/* manual or auto */}
                            <div
                                id="manual-auto-btns"
                                className="flex bg-stake-700 h-13 w-[90%] rounded-4xl font-semibold"
                            >
                                <div
                                    onClick={() => setManual(true)}
                                    className={`w-[50%] rounded-4xl hover:bg-stake-200 m-1 text-sm flex items-center justify-center cursor-pointer ${
                                        manual ? "bg-stake-200" : ""
                                    }`}
                                >
                                    Manual
                                </div>
                                <div
                                    onClick={() => setManual(false)}
                                    className={`w-[50%] rounded-4xl hover:bg-stake-200 m-1 text-sm flex items-center justify-center cursor-pointer ${
                                        !manual ? "bg-stake-200" : ""
                                    }`}
                                >
                                    Auto
                                </div>
                            </div>
                            {/* bet amount */}
                            <div className="w-[90%]">
                                <div className="flex justify-between text-stake-gray-300 text-sm font-semibold pb-1">
                                    <div>Bet Amount</div>
                                    <div>{"$" + bettingAmt}</div>
                                </div>
                                <div
                                    className={`flex items-center justify-center bg-stake-200 h-10 ${
                                        gameOn || isModalOpen
                                            ? "cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    <input
                                        className={`bg-stake-500 h-full w-full p-1 px-2 selection:bg-stake-100 font-semibold focus:ring-0 outiline-none focus:outline-none `}
                                        placeholder="$0.00"
                                        type="number"
                                        min={0}
                                        onChange={(e) => handleBettingAmt(e)}
                                        value={bettingAmt}
                                        disabled={gameOn}
                                    ></input>
                                    <div className="flex font-semibold cursor-pointer">
                                        <div
                                            onClick={() => {
                                                if (gameOn) return;
                                                setBettingAmt((prev) =>
                                                    Number(
                                                        (prev / 2).toFixed(2)
                                                    )
                                                );
                                            }}
                                            className={`flex items-center justify-center rounded-sm hover:bg-stake-100 w-10 h-10 border-r-stake-300 border-r-2 ${
                                                gameOn
                                                    ? "cursor-not-allowed"
                                                    : ""
                                            }`}
                                        >
                                            1/2
                                        </div>
                                        <div
                                            onClick={() => {
                                                if (gameOn) return;
                                                if (bettingAmt * 2 > balance) {
                                                    alert(
                                                        "you're broke mate, pls top up or stfu"
                                                    );
                                                    return;
                                                }
                                                setBettingAmt(
                                                    (prev) => prev * 2
                                                );
                                            }}
                                            className={`flex items-center justify-center rounded-sm hover:bg-stake-100 w-10 h-10 ${
                                                gameOn
                                                    ? "cursor-not-allowed"
                                                    : ""
                                            }`}
                                        >
                                            2x
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* no of mines */}
                            {!gameOn && (
                                <div className="w-[90%]">
                                    <div className="bg-stake-30000 font-semibold text-stake-gray-300  text-sm pb-1">
                                        Mines
                                    </div>
                                    <select
                                        onChange={(e) =>
                                            setNumberOfMines(
                                                Number(e.target.value)
                                            )
                                        }
                                        value={numberOfMines}
                                        className="border p-2 rounded-md focus:ring-0 outiline-none focus:outline-none bg-stake-500 text-white w-[100%]"
                                    >
                                        {Array.from({ length: 24 }, (_, i) => (
                                            <option
                                                key={i + 1}
                                                value={i + 1}
                                                className="w-[100%]"
                                            >
                                                {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {gameOn && (
                                <>
                                    <div className="w-[90%]">
                                        <div className="flex justify-between w-full text-stake-gray-300 font-semibold">
                                            <div className="w-[50%]">Mines</div>
                                            <div className="w-[50%]">Gems</div>
                                        </div>
                                        <div className="flex justify-between w-full">
                                            <div className="w-[48%] bg-stake-200 rounded-sm py-2 px-2 font-semibold text-sm">
                                                {numberOfMines}
                                            </div>
                                            <div className="w-[48%] bg-stake-200 rounded-sm py-2 px-2 font-semibold text-sm">
                                                {N_TILES - numberOfMines}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-[90%]">
                                        <div className="flex justify-between w-full text-stake-gray-300 font-semibold">
                                            <div className="">
                                                Total Profit (
                                                {multiplier.toFixed(2)}x)
                                            </div>
                                            <div className="">
                                                {"$" +
                                                    (
                                                        bettingAmt * multiplier
                                                    ).toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="flex justify-between w-full">
                                            <div className="w-full bg-stake-200 rounded-sm py-2 px-2 font-semibold text-sm">
                                                {(
                                                    bettingAmt * multiplier -
                                                    bettingAmt
                                                ).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            {/* bet button */}
                            {gameOn && (
                                <div
                                    onClick={() => {
                                        handleRandomTilePick();
                                    }}
                                    className="w-[90%] h-15 flex items-center justify-center bg-stake-200 hover:bg-stake-100 rounded-md text-white font-bold cursor-pointer"
                                >
                                    Pick Random Tile
                                </div>
                            )}
                            <div
                                onClick={() => {
                                    if (!gameOn) handleBet();
                                    else handleCashOut();
                                }}
                                className="w-[90%] h-15 flex items-center justify-center bg-stakegreen-500 hover:bg-stakegreen-450 rounded-md text-stake-500 font-bold cursor-pointer"
                            >
                                {!gameOn && "Bet"}
                                {gameOn && "CashOut"}
                            </div>
                        </div>
                        {/* actual game area */}
                        <div
                            id="mines-game-area"
                            className="relative flex flex-grow items-center py-3 justify-center bg-stake-700 rounded-tr-lg"
                        >
                            {/* win / loss modal */}
                            <Modal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                            >
                                <div className="border-6 border-stakegreen-450 rounded-xl flex flex-col items-center justify-center text-stakegreen-450 font-bold text-2xl h-30 w-35 bg-stake-500">
                                    {" "}
                                    <div className="w-full h-full flex items-center justify-center">
                                        {winningMultiplier.toFixed(2)} {"x"}
                                    </div>
                                    <div className="bg-stake-100 w-15 h-2"></div>
                                    <div className="w-full h-full flex items-center justify-center text-xl">
                                        ${finalWinnings.toFixed(2)}
                                    </div>
                                </div>
                            </Modal>
                            {/* grid of tiles */}
                            <div
                                id="mines-grid"
                                className="grid grid-cols-5 gap-3"
                            >
                                {array.map((v, i) => (
                                    <motion.div
                                        key={i}
                                        onClick={() => handleTileClick(i)}
                                        className={`h-28 w-28 rounded-md flex items-center justify-center ${
                                            revealedState[i] ===
                                                TileState.REVEALED ||
                                            revealedState[i] ==
                                                TileState.CASHEDOUT
                                                ? "bg-stake-800"
                                                : ""
                                        }
									${
                                        revealedState[i] ==
                                            TileState.UNREVEALED ||
                                        revealedState[i] == TileState.LOADING
                                            ? "bg-stake-200 hover:bg-stake-100 hover:-translate-y-1 active:translate-y-0 shadow-[inset_0px_-6px_0px_#1f3540] cursor-pointer"
                                            : ""
                                    }
									`}
                                        animate={
                                            revealedState[i] ===
                                            TileState.LOADING
                                                ? { scale: [1.1, 1, 1.1] }
                                                : { scale: 1 } // Default scale when not loading
                                        }
                                        transition={
                                            revealedState[i] ===
                                            TileState.LOADING
                                                ? {
                                                      duration: 0.6,
                                                      repeat: Infinity,
                                                      ease: "easeInOut",
                                                  }
                                                : { duration: 0.2 }
                                        }
                                    >
                                        {revealedState[i] !=
                                            TileState.UNREVEALED &&
                                            revealedState[i] !=
                                                TileState.LOADING &&
                                            minesState[i] === 1 && (
                                                <img
                                                    className={`${
                                                        revealedState[i] ==
                                                        TileState.CASHEDOUT
                                                            ? "h-14 w-14 opacity-75"
                                                            : "h-23 w-23"
                                                    }`}
                                                    src="./mine.svg"
                                                ></img>
                                            )}
                                        {revealedState[i] !=
                                            TileState.UNREVEALED &&
                                            revealedState[i] !=
                                                TileState.LOADING &&
                                            minesState[i] === 0 && (
                                                <img
                                                    className={`${
                                                        revealedState[i] ==
                                                        TileState.CASHEDOUT
                                                            ? "h-14 w-14 opacity-75"
                                                            : "h-23 w-23"
                                                    }`}
                                                    src="./diamond.svg"
                                                ></img>
                                            )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="w-full bg-stake-700 border-t-3 border-stake-300 py-3 flex items-center justify-between rounded-b-lg">
                        <div></div>
                        <img src="./stake-logo-navy.svg"></img>
                        <div className="px-3 text-stake-gray-300 font-semibold cursor-pointer">
                            Fairness
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
