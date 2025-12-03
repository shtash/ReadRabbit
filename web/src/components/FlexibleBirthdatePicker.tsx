"use client";

import { useState, useEffect } from "react";
import { Calendar, X } from "lucide-react";

interface FlexibleBirthdatePickerProps {
    value: {
        year: number | null;
        month: number | null;
        day: number | null;
    };
    onChange: (value: { year: number | null; month: number | null; day: number | null }) => void;
    label?: string;
}

export function FlexibleBirthdatePicker({ value, onChange, label = "Birthdate" }: FlexibleBirthdatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    // Sync temp value when prop changes
    useEffect(() => {
        setTempValue(value);
    }, [value]);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (year: number | null, month: number | null) => {
        if (!year || month === null) return 31;
        return new Date(year, month + 1, 0).getDate();
    };

    const handleSave = () => {
        onChange(tempValue);
        setIsOpen(false);
    };

    const displayText = value.year
        ? `${value.month !== null ? months[value.month] : ""} ${value.day ? value.day + "," : ""} ${value.year}`.trim()
        : "Select birthdate";

    return (
        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</label>

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-full border-b-2 border-slate-200 bg-transparent py-2 text-left text-lg font-bold text-slate-900 transition-colors hover:border-orange-400 focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:text-white"
            >
                <span className={!value.year ? "text-slate-400" : ""}>
                    {displayText}
                </span>
                <Calendar className="absolute right-0 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="relative w-[95%] max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-900 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Birthdate</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Year Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">Year (Required)</label>
                                <select
                                    value={tempValue.year || ""}
                                    onChange={(e) => setTempValue({ ...tempValue, year: Number(e.target.value) })}
                                    className="w-full rounded-lg border-2 border-slate-200 p-2 font-bold text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                >
                                    <option value="" disabled>Select Year</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Month Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">Month (Optional)</label>
                                <select
                                    value={tempValue.month !== null ? tempValue.month : ""}
                                    onChange={(e) => setTempValue({ ...tempValue, month: e.target.value === "" ? null : Number(e.target.value), day: null })}
                                    className="w-full rounded-lg border-2 border-slate-200 p-2 font-bold text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                >
                                    <option value="">Unknown / Skip</option>
                                    {months.map((month, index) => (
                                        <option key={month} value={index}>{month}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Day Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">Day (Optional)</label>
                                <select
                                    value={tempValue.day || ""}
                                    onChange={(e) => setTempValue({ ...tempValue, day: e.target.value === "" ? null : Number(e.target.value) })}
                                    disabled={tempValue.month === null}
                                    className="w-full rounded-lg border-2 border-slate-200 p-2 font-bold text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white disabled:opacity-50"
                                >
                                    <option value="">Unknown / Skip</option>
                                    {Array.from({ length: getDaysInMonth(tempValue.year, tempValue.month) }, (_, i) => i + 1).map((day) => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 rounded-full bg-slate-100 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!tempValue.year}
                                className="flex-1 rounded-full bg-orange-500 py-3 font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
