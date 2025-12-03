"use client";

import { X, AlertCircle } from "lucide-react";

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
}

export function ErrorModal({ isOpen, onClose, title = "Error", message }: ErrorModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {title}
                    </h2>

                    <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className="mt-4 w-full rounded-full bg-slate-900 py-3 font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 dark:bg-white dark:text-slate-900"
                    >
                        Okay, got it
                    </button>
                </div>
            </div>
        </div>
    );
}
