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
    const [resetInput, setResetInput] = useState<string>("");
    const {
        balance,
        addWinnings,
        placeBet,
        inResetProcess,
        toggleInResetProcess,
        resetBalance,
    } = useWalletStore();
    const [isFairnessModalOpen, setIsFairnessModalOpen] =
        useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const betSound = new Audio("./bet.mp3");
    const winSound = new Audio("./win.mp3");
    const gemSound = new Audio("./gemclink.mp3");
    const mineSound = new Audio("./mineblast.mp3");
    useEffect(() => {
        if (revealedState.includes(2)) return; // if state is loading wait till all the updation has happened
        calculateMultiplier();
        checkIfWon();
    }, [revealedState]);
    function handleResetInput(e: React.ChangeEvent<HTMLInputElement>): void {
        e.preventDefault();

        setResetInput(() => e.target.value);
    }
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
        setWinningMultipler(() => curr_multiplier);
    }
    function setRevealedStateTo(clickedIndex: number, state: number): void {
        setRevealedState((prev) => {
            let newRevealedState = [...prev];
            newRevealedState[clickedIndex] = state;
            return newRevealedState;
        });
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

        betSound.play();
    }
    function handleTileClick(clickedIndex: number): void {
        if (!gameOn) return;
        if (revealedState[clickedIndex] != TileState.UNREVEALED) return;
        // alert(minesState);
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
                mineSound.play();
                // loseSound.play();

                setMultiplier(1);
            }, 500);
        } else {
            setTimeout(() => {
                setRevealedStateTo(clickedIndex, TileState.REVEALED);
                gemSound.play();
            }, 500);
        }
    }
    function handleRandomTilePick() {
        setLoading(true);
        let clickable_subset_of_tiles: number[] = [];
        revealedState.forEach((v, i) => {
            if (v == TileState.UNREVEALED) {
                clickable_subset_of_tiles.push(i);
            }
        });
        let idx = Math.floor(Math.random() * clickable_subset_of_tiles.length);
        let idx_to_be_clicked = clickable_subset_of_tiles[idx];
        handleTileClick(idx_to_be_clicked);
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }
    function checkIfWon(): void {
        let flag: boolean = false;
        for (let i = 0; i < N_TILES; i++) {
            if (
                minesState[i] == 0 &&
                revealedState[i] == TileState.UNREVEALED
            ) {
                // if it is a gem and not been revealed
                flag = true;
                break;
            }
        }
        if (flag) return; // if it is a gem and not been revealed
        handleCashOut();
    }
    function handleCashOut() {
        if (!gameOn) return;
        if (!revealedState.some((v, _) => v == TileState.REVEALED)) {
            alert("select alteast one tile");
            return;
        }
        setLoading(true);

        setWinningMultipler(() => multiplier);
        // revealing all the untouched tiles
        setFinalWinnings(() => multiplier * bettingAmt);
        // const winnings = multiplier * bettingAmt
        setTimeout(() => {
            addWinnings(multiplier * bettingAmt);
            setRevealedState((prev) => {
                let newRevealedState = [...prev];
                newRevealedState.forEach((v, i) => {
                    if (v == 0) newRevealedState[i] = TileState.CASHEDOUT;
                });
                return newRevealedState;
            });
            winSound.play();
            setIsModalOpen(true);
            setGameOn(false);
            setLoading(false);
        }, 1000);
    }
    return (
        <>
            <div
                id="mines-page"
                className="flex flex-1 flex-col items-center w-xs aftermobile:w-md aftertablet:w-3xl afterlargelaptop:w-6xl overflow-y-scroll p-4 aftermoble:py-10 bg-stake-500 "
            >
                {/* reset balance modal */}
                <Modal
                    isOpen={inResetProcess}
                    onClose={() => {
                        toggleInResetProcess();
                    }}
                >
                    <div className="bg-stake-800 text-justify w-60 h-120 aftermobile:w-100 aftermobile:h-80 flex flex-col justify-center items-center rounded-2xl px-10 font-semibold text-stake-gray-300">
                        <div className="w-full text-center text-3xl">
                            🤣🤣🫵🫵<br></br>
                        </div>

                        <span className="text-red-400 font-bold py-5 text-center">
                            If this were real you would have <br></br>lost REAL
                            MONEY!!
                        </span>
                        <div className="w-full">
                            Type: "reset-balance" to reset the balance
                        </div>
                        <br></br>
                        <input
                            id="resetbalancetask"
                            placeholder="hahahahaha"
                            value={resetInput}
                            className="bg-stake-700 border-2 border-stake-gray-300"
                            onChange={(e) => handleResetInput(e)}
                        ></input>
                        <br></br>
                        <div className="flex gap-2">
                            <button
                                disabled={resetInput !== "reset-balance"}
                                className={`hover:bg-stake-200 p-2 bg-stake-300 rounded-2xl ${
                                    resetInput === "reset-balance"
                                        ? "cursor-pointer"
                                        : "cursor-not-allowed"
                                }`}
                                onClick={() => {
                                    toggleInResetProcess();
                                    setResetInput("");
                                    resetBalance();
                                }}
                            >
                                {resetInput === "reset-balance" &&
                                    "RESET and Close"}
                                {resetInput !== "reset-balance" &&
                                    "Type in the input if you want to reset!!"}
                            </button>
                            <button
                                className={`hover:bg-stake-200 p-2 bg-stake-300 rounded-2xl cursor-pointer`}
                                onClick={() => {
                                    toggleInResetProcess();
                                    setResetInput("");
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
                {/* game div */}
                <div id="gamediv" className="flex-1 ">
                    <div
                        id="setting+game"
                        className="flex flex-col-reverse w-xs aftermobile:w-md aftertablet:w-3xl aftertablet:flex-row afterlargelaptop:w-6xl afterlargelaptop:flex-row bg-stake-300 rounded-t-lg relative"
                    >
                        {/* fairness modal */}
                        <Modal
                            isOpen={isFairnessModalOpen}
                            onClose={() => setIsFairnessModalOpen(false)}
                        >
                            <div className="bg-stake-800 text-justify w-60 h-100 aftermobile:w-100 aftermobile:h-80 flex flex-col justify-center items-center rounded-2xl px-10 font-semibold text-stake-gray-300">
                                <div className="w-full">
                                    Betting apps don't need to be rigged and
                                    most of them are not rigged at all. Thats
                                    the way it works. They'll make money
                                    mathematically, and
                                </div>

                                <span className="text-red-400 font-bold py-5">
                                    YOU WILL LOSE MONEY EVENTUALLY!
                                </span>
                                <button
                                    className="hover:bg-stake-200 p-2 bg-stake-300 rounded-2xl"
                                    onClick={() =>
                                        setIsFairnessModalOpen(false)
                                    }
                                >
                                    close
                                </button>
                            </div>
                        </Modal>
                        {/* settings and bet buttons */}
                        <div
                            id="bet-setting"
                            className="flex flex-col-reverse aftertablet:flex-col items-center py-3 w-xs gap-2 aftermobile:w-md aftertablet:w-2xs"
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
                                        className={`bg-stake-500 h-full w-full p-1 px-2 selection:bg-stake-100 font-semibold focus:ring-0 outiline-none focus:outline-none ${
                                            bettingAmt > balance ? "" : ""
                                        }`}
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
                                        className="border border-stake-gray-300 p-2 rounded-md focus:ring-0 outiline-none focus:outline-none bg-stake-500 text-white w-[100%]"
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
                                    className={`w-[90%] h-15 flex items-center justify-center bg-stake-200 hover:bg-stake-100 rounded-md text-white font-bold cursor-pointer ${
                                        loading &&
                                        "opacity-70 pointer-events-none"
                                    }`}
                                >
                                    Pick Random Tile
                                </div>
                            )}
                            <div
                                onClick={() => {
                                    if (!gameOn) handleBet();
                                    else handleCashOut();
                                }}
                                className={`w-[90%] h-15 flex items-center justify-center bg-stakegreen-500 hover:bg-stakegreen-450 rounded-md text-stake-500 font-bold cursor-pointer transition-opacity ${
                                    loading && "opacity-75 pointer-events-none"
                                }`}
                            >
                                {!gameOn && "Bet"}
                                {gameOn && !loading && "CashOut"}
                                {gameOn && loading && (
                                    <img className="w-5" src="./bomb.svg"></img>
                                )}
                            </div>
                        </div>
                        {/* actual game area */}
                        <div
                            id="mines-game-area"
                            className="relative flex flex-grow items-center py-2 aftermobile:py-3 justify-center bg-stake-700 rounded-t-lg aftertablet:rounded-tr-lg aftertablet:rounded-tl-none"
                        >
                            {/* win / loss modal */}
                            <Modal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                            >
                                <div className="border-6 border-stakegreen-450 rounded-xl flex flex-col items-center justify-center text-stakegreen-450 font-bold text-2xl h-30 w-35 bg-stake-500">
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
                                className="grid grid-cols-5 gap-1.5 aftermobile:gap-2 afterlaptop:gap-3"
                            >
                                {array.map((_, i) => (
                                    <motion.div
                                        key={i}
                                        onClick={() => handleTileClick(i)}
                                        className={`w-14 aspect-square aftermobile:w-19 aftertablet:w-20 afterlargelaptop:w-28  rounded-md flex items-center justify-center ${
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
                                            ? "bg-stake-200 hover:bg-stake-100 hover:-translate-y-1 active:translate-y-0 shadow-[inset_0px_-3px_0px_#1f3540] aftermobile:shadow-[inset_0px_-4px_0px_#1f3540] afterlaptop:shadow-[inset_0px_-6px_0px_#1f3540] cursor-pointer"
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
                                                TileState.LOADING && (
                                                <img
                                                    className={`aspect-square ${
                                                        revealedState[i] ==
                                                        TileState.CASHEDOUT
                                                            ? "w-7 aftermobile:w-10 aftertablet:w-11 afterlaptop:w-12 afterlargelaptop:w-14 opacity-75"
                                                            : "w-12 aftermobile:w-16 aftertablet:w-17 afterlaptop:w-18 afterlargelaptop:w-23"
                                                    }`}
                                                    src={`${
                                                        minesState[i] === 1
                                                            ? "./mine.svg"
                                                            : "./diamond.svg"
                                                    }`}
                                                ></img>
                                            )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* fairness */}
                    <div className="w-full bg-stake-700 border-t-3 border-stake-300 py-3 flex items-center justify-between rounded-b-lg">
                        <div></div>
                        <img src="./stake-logo-navy.svg"></img>
                        <div
                            onClick={() => setIsFairnessModalOpen(true)}
                            className="px-3 text-stake-gray-300 font-semibold cursor-pointer"
                        >
                            Fairness
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
