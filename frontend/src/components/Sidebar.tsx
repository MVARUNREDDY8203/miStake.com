import { useState } from "react";

export default function SideBar() {
    const sidebar_texts = [
        { name: "Mines", src: "./diamond_smol.svg" },
        { name: "Plinko", src: "./plinko_smol.svg" },
        { name: "Dice", src: "./dice_smol.svg" },
        { name: "Pump", src: "./balloon_smol.svg" },
    ];
    const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <>
            <div
                id="sidebar"
                className={`flex h-screen text-white hidden afterlaptop:block transition-all duration-300 ease-in-out ${
                    isOpen ? "w-3xs" : "w-[4rem]"
                }`}
            >
                <div
                    className={`h-full  flex flex-col overflow-hidden bg-stake-700 transition-all duration-300 ease-in-out ${
                        isOpen ? "w-3xs" : "w-[4rem]"
                    }`}
                >
                    {/* header */}
                    <div
                        id="sidebar-header-section"
                        className="flex items-center w-2xs h-16 shadow-[0_4px_6px_-1px_#0003,0_2px_4px_-1px_#0000001f]"
                    >
                        <div
                            onClick={() => setIsOpen((prev) => !prev)}
                            className="p-5 cursor-pointer"
                        >
                            <img
                                className="w-5 fill-amber-50 "
                                src="./three-bars.svg"
                            ></img>
                        </div>
                        {isOpen && (
                            <div className="flex w-full gap-2">
                                {/* Casino Section */}
                                <div className="relative group  rounded-sm cursor-pointer">
                                    <img
                                        className="w-20 grayscale-0 group-hover:grayscale-0 transition rounded-sm"
                                        src="./casino.jpg"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                        CASINO
                                    </div>
                                </div>

                                {/* Sports Section */}
                                <div className="relative group  rounded-sm cursor-pointer">
                                    <img
                                        className="w-20 grayscale group-hover:grayscale-0 transition rounded-sm"
                                        src="./sports.jpg"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                        SPORTS
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* scrollable sections */}
                    <div
                        id="sidebar-body"
                        className={`flex flex-col flex-1 items-center overflow-y-auto transition-all duration-300 ease-in-out ${
                            isOpen ? "w-full" : "w-[4rem]"
                        }`}
                    >
                        {/* casiono sports when sidebar is closed */}
                        {!isOpen && (
                            <div className="w-80% flex-col mt-3">
                                <div>
                                    <img
                                        className="rounded-md w-10 grayscale-0 hover:grayscale-0 transition-all duration-200"
                                        src="./casino_small.jpg"
                                    ></img>
                                </div>
                                <div className="mt-2">
                                    <img
                                        className="rounded-md w-10 grayscale hover:grayscale-0 transition-all duration-200"
                                        src="./sports_small.jpg"
                                    ></img>
                                </div>
                            </div>
                        )}
                        <div
                            className={`bg-stake-500 rounded-sm flex flex-col items-center justify-center mt-5 transition-all duration-300 ease-in-out ${
                                isOpen ? "w-[90%]" : "w-[80%]"
                            }`}
                        >
                            {isOpen && (
                                <div className="w-full text-sm font-semibold px-3 py-3 border-b-2 border-stake-100">
                                    Games
                                </div>
                            )}
                            {sidebar_texts.map((val, idx) => {
                                return (
                                    <div
                                        key={idx}
                                        className={`w-full hover:bg-stake-300 text-sm font-semibold px-3 py-2 flex  items-center gap-3 transition-all duration-300 ease-in-out ${
                                            isOpen
                                                ? ""
                                                : "justify-center aspect-square"
                                        }`}
                                    >
                                        <img
                                            className="w-4 aspect-square fill-white"
                                            src={val.src}
                                        ></img>
                                        {isOpen && <div> {val.name}</div>}
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
