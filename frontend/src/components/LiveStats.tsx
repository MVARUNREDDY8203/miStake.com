import { motion, useDragControls } from "framer-motion";
import Graph from "./Graph";
import { useWalletStore } from "../stores/wallet";
import { DEFAULT_BALANCE } from "../constants/constants";
export default function LiveStats({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: (a: boolean) => void;
}) {
    const dragControls = useDragControls();
    const { transactions } = useWalletStore();
    const handleClose = () => {
        setIsOpen(false);
    };

    if (!isOpen) return null;

    const calculatePnL = () => {
        return (
            transactions[transactions.length - 1].balance - DEFAULT_BALANCE
        ).toFixed(2);
    };
    const calculateWagered = () => {
        let wagered: number = 0;
        for (let i = 1; i < transactions.length; i++)
            wagered += transactions[i].init_val;

        return Number(wagered).toFixed(2);
    };
    const calculateWins = () => {
        return transactions.filter((v, _) => v.multiplier > 0).length - 1;
    };
    return (
        <motion.div
            drag
            dragListener={false}
            dragTransition={{ power: 0 }}
            dragControls={dragControls}
            className="fixed z-100 top-10 left-10 bg-stake-500 shadow-2xl rounded-2xl p-4 cursor-move w-[16rem] flex flex-col gap-2 items-center"
            onPointerDown={(e) => dragControls.start(e)}
        >
            <div className="flex justify-between mb-2 w-[95%]">
                <h2 className="text-xl font-semibold ">Live Stats</h2>
                <button
                    onClick={handleClose}
                    className="text-gray-500 font-bold hover:text-gray-200 cursor-pointer"
                >
                    X
                </button>
            </div>
            <div className="bg-stake-700 w-[98%] flex justify-between  px-5 py-5 rounded-xl font-bold text-stake-gray-300">
                <div className="flex-col w-[65%]">
                    <div>Profit</div>
                    <div
                        className={`${
                            Number(calculatePnL()) < 0
                                ? "text-red-600"
                                : "text-stakegreen-500"
                        }  text-sm pb-2`}
                    >
                        {"$ "}
                        {calculatePnL()}
                    </div>
                    <div>Wagered</div>
                    <div className="text-white text-sm">
                        {"$ "}
                        {calculateWagered()}
                    </div>
                </div>
                <div className=" w-[35%]">
                    <div>Wins</div>
                    <div className="text-stakegreen-500 pb-1">
                        {calculateWins()}
                    </div>
                    <div>Losses</div>
                    <div className="text-red-600">
                        {transactions.length - 1 - calculateWins()}
                    </div>
                </div>
            </div>
            <Graph />
        </motion.div>
    );
}
