import { useState } from "react";

export default function SideBar() {
    // const array = Array.from({ length: 10 }, (_, index) => index);
    const sidebar_texts = [
        { name: "Mines", src: "./diamond_smol.svg" },
        { name: "Plinko", src: "./plinko_smol.svg" },
        { name: "Dice", src: "./dice_smol.svg" },
        { name: "Pump", src: "./balloon_smol.svg" },
    ];
    const [isOpen, setIsOpen] = useState<boolean>(true);
    return (
        <>
            <div className={`flex w-64 h-screen text-white `}>
                <div className="h-full w-3xs flex flex-col overflow-hidden bg-stake-700 ">
                    {/* header */}
                    <div
                        id="sidebar-header-section"
                        className="flex w-2xs h-16 shadow-[0_4px_6px_-1px_#0003,0_2px_4px_-1px_#0000001f]"
                    >
                        <button onClick={() => setIsOpen((prev) => !prev)}>
                            3 dots
                        </button>
                        casino sports
                    </div>
                    {/* scrollable sections */}
                    <div
                        id="sidebar-scroll-section"
                        className="w-full flex flex-col flex-1 items-center overflow-y-auto"
                    >
                        <div className="bg-stake-500 rounded-sm flex flex-col items-center justify-center w-[90%] mt-5">
                            <div className="w-full  text-sm font-semibold px-3 py-3 border-b-2 border-stake-100">
                                Games
                            </div>
                            {sidebar_texts.map((val, idx) => {
                                return (
                                    <div
                                        key={idx}
                                        className="w-full hover:bg-stake-300 text-sm font-semibold px-3 py-2 flex items-center gap-3"
                                    >
                                        <img
                                            className="w-4 h-4 fill-white"
                                            src={val.src}
                                        ></img>
                                        <div> {val.name}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
