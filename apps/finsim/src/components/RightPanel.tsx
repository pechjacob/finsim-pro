import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface RightPanelProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const RightPanel: React.FC<RightPanelProps> = ({
    isOpen,
    onClose,
    title,
    children
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for clicking outside */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 z-[100] bg-black/20 backdrop-blur-[2px]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute top-0 right-0 bottom-10 z-[101] flex"
                    >
                        {/* Collapse Handle */}
                        <div
                            onClick={onClose}
                            className="w-5 h-full cursor-pointer bg-gray-900/80 hover:bg-gray-800/80 backdrop-blur-md border-l border-t border-gray-700 flex items-center justify-center group transition-colors rounded-tl-2xl rounded-bl-2xl overflow-hidden"
                            title="Close Panel"
                        >
                            <div className="text-gray-500 group-hover:text-white transition-colors">
                                <ChevronRight size={16} />
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="w-80 h-full bg-gray-900/80 backdrop-blur-md border-l border-t border-gray-800 flex flex-col shadow-2xl -ml-[1px]">
                            {/* Header */}
                            <div className="h-12 border-b border-gray-800 flex items-center px-4 shrink-0">
                                <h2 className="text-sm font-bold text-gray-100 tracking-wider uppercase">{title}</h2>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-4 text-gray-300">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
