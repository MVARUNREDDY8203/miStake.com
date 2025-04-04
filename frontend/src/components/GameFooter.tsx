import { useState } from "react";
import Modal from "./Modal";
import LiveStats from "./LiveStats";

export default function GameFooter() {
    const [isFairnessModalOpen, setIsFairnessModalOpen] =
        useState<boolean>(false);
    const [isLiveStatsOpen, setIsLiveStatsOpen] = useState<boolean>(false);
    return (
        <>
            {/* fairness modal */}
            <Modal
                isOpen={isFairnessModalOpen}
                onClose={() => setIsFairnessModalOpen(false)}
            >
                <div className="bg-stake-800 text-justify w-60 h-100 aftermobile:w-100 aftermobile:h-80 flex flex-col justify-center items-center rounded-2xl px-10 font-semibold text-stake-gray-300">
                    <div className="w-full">
                        Betting apps don't need to be rigged and most of them
                        are not rigged at all. Thats the way it works. They'll
                        make money mathematically, and
                    </div>

                    <span className="text-red-400 font-bold py-5">
                        YOU WILL LOSE MONEY EVENTUALLY!
                    </span>
                    <button
                        className="hover:bg-stake-200 p-2 bg-stake-300 rounded-2xl"
                        onClick={() => setIsFairnessModalOpen(false)}
                    >
                        close
                    </button>
                </div>
            </Modal>
            <LiveStats
                isOpen={isLiveStatsOpen}
                setIsOpen={setIsLiveStatsOpen}
            ></LiveStats>
            <div className="w-full bg-stake-700 border-t-3 border-stake-300 py-3 flex items-center justify-between rounded-b-lg">
                <div
                    className="px-5 cursor-pointer"
                    onClick={() => setIsLiveStatsOpen((prev) => !prev)}
                >
                    <img className="w-5" src="./graph.svg"></img>
                </div>
                <img src="./stake-logo-navy.svg"></img>
                <div
                    onClick={() => setIsFairnessModalOpen(true)}
                    className="px-3 text-stake-gray-300 font-semibold cursor-pointer"
                >
                    Fairness
                </div>
            </div>
        </>
    );
}
