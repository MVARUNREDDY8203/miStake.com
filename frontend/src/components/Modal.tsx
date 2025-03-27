import React from "react";
import { motion } from "framer-motion";
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

// NOTE: add relative to the parent
export default function Modal({ isOpen, onClose, children }: ModalProps) {
    if (!isOpen) return null;
    () => onClose();
    return (
        <>
            <div className="flex items-center justify-center bg-black/50 absolute inset-0 z-50 rounded-t-lg">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </div>
        </>
    );
}
