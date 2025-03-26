"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BalloonGame() {
    const [score, setScore] = useState(0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-200">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">
                    Balloon Pump Game
                </h1>

                <div className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-auto">
                    <div className="text-center mb-4">
                        <p className="text-lg font-medium">Score: {score}</p>
                    </div>

                    <BalloonAnimation />

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <p>Pump the balloon, but don't let it pop!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

("use client");

function BalloonAnimation() {
    const [inflation, setInflation] = useState(0);
    const [isPopped, setIsPopped] = useState(false);
    const maxInflation = 100;

    const handlePump = () => {
        if (isPopped) {
            // Reset balloon
            setIsPopped(false);
            setInflation(0);
            return;
        }

        if (inflation >= maxInflation) {
            // Pop the balloon
            setIsPopped(true);
            return;
        }

        // Inflate the balloon
        setInflation((prev) => Math.min(prev + 20, maxInflation));
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-sky-50">
            <div className="relative flex flex-col items-center mb-8">
                <AnimatePresence mode="wait">
                    {isPopped ? (
                        <motion.div
                            key="popped"
                            initial={{ scale: 1, opacity: 1 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute top-0"
                        >
                            {/* Balloon fragments */}
                            <motion.div
                                className="absolute w-8 h-8 bg-red-400 rounded-full"
                                initial={{ x: 0, y: 0 }}
                                animate={{ x: -50, y: -70, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            />
                            <motion.div
                                className="absolute w-10 h-10 bg-red-500 rounded-full"
                                initial={{ x: 0, y: 0 }}
                                animate={{ x: 60, y: -40, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            />
                            <motion.div
                                className="absolute w-6 h-6 bg-red-300 rounded-full"
                                initial={{ x: 0, y: 0 }}
                                animate={{ x: 30, y: -90, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            />
                        </motion.div>
                    ) : (
                        <motion.div key="balloon" className="relative" layout>
                            <BalloonSvg inflation={inflation} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Nozzle - always visible */}
                <div className="relative z-10">
                    <div className="w-8 h-4 bg-gray-400 rounded-t-lg" />
                    <div className="w-4 h-8 bg-gray-500 mx-auto rounded-b-lg" />
                </div>
            </div>

            <div className="flex flex-col items-center">
                <button
                    onClick={handlePump}
                    className="px-6 py-3 mb-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors"
                >
                    {isPopped ? "Reset Balloon" : "Pump"}
                </button>

                {!isPopped && (
                    <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-red-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${inflation}%` }}
                            transition={{ type: "spring", stiffness: 100 }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// Balloon SVG component that changes shape based on inflation level
function BalloonSvg({ inflation }: { inflation: number }) {
    // Calculate balloon properties based on inflation
    const balloonHeight = 50 + inflation * 1.5;
    const balloonWidth = 40 + inflation * 1.2;
    const balloonColor = `rgb(239, ${100 + inflation}, ${
        100 + inflation * 0.5
    })`;

    // Calculate the path for the balloon based on inflation
    const getBalloonPath = () => {
        if (inflation < 10) {
            // Limp balloon that droops to the side
            return `
        M 0,0
        C -10,10 -15,20 -5,30
        C -20,40 -30,60 -20,70
        C -10,75 10,70 15,60
        C 20,50 10,30 5,20
        C 0,10 0,0 0,0
        Z
      `;
        } else {
            // Gradually inflating balloon
            const inflationFactor = inflation / 100;
            const topWidth = 30 * inflationFactor;
            const bodyWidth = 50 * inflationFactor;
            const height = 80 * inflationFactor;

            return `
        M 0,0
        C -${topWidth * 0.5},${height * 0.1} -${bodyWidth},${
                height * 0.3
            } -${bodyWidth},${height * 0.5}
        C -${bodyWidth},${height * 0.7} -${bodyWidth * 0.7},${
                height * 0.9
            } 0,${height}
        C ${bodyWidth * 0.7},${height * 0.9} ${bodyWidth},${
                height * 0.7
            } ${bodyWidth},${height * 0.5}
        C ${bodyWidth},${height * 0.3} ${topWidth * 0.5},${height * 0.1} 0,0
        Z
      `;
        }
    };

    return (
        <motion.svg
            width={balloonWidth * 2}
            height={balloonHeight}
            viewBox={`-${balloonWidth} -10 ${balloonWidth * 2} ${
                balloonHeight + 10
            }`}
            initial={{ rotate: inflation < 10 ? 45 : 0 }}
            animate={{
                rotate: inflation < 10 ? 45 : 0,
                y: inflation > 50 ? -10 : 0,
            }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 10,
            }}
        >
            <motion.path
                d={getBalloonPath()}
                fill={balloonColor}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
            />

            {/* Balloon knot/tie at the bottom */}
            {inflation > 20 && (
                <motion.ellipse
                    cx="0"
                    cy="0"
                    rx="5"
                    ry="3"
                    fill={`rgb(200, ${80 + inflation * 0.5}, ${
                        80 + inflation * 0.5
                    })`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                />
            )}

            {/* String/ribbon hanging from balloon when inflated */}
            {inflation > 30 && (
                <motion.path
                    d="M 0,0 C 2,5 -2,10 0,15"
                    stroke="gray"
                    strokeWidth="1"
                    fill="transparent"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                />
            )}
        </motion.svg>
    );
}
