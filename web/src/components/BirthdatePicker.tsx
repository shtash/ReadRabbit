"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { Calendar, X } from "lucide-react";
import "react-day-picker/dist/style.css";

interface BirthdatePickerProps {
    value: string; // ISO date string or empty
    onChange: (dateString: string) => void;
    label?: string;
}

export function BirthdatePicker({ value, onChange, label = "Birthdate" }: BirthdatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedDate = value ? new Date(value) : undefined;

    const handleSelect = (date: Date | undefined) => {
        if (date) {
            // Convert to ISO date string (YYYY-MM-DD)
            const isoString = date.toISOString().split('T')[0];
            onChange(isoString);
            setIsOpen(false);
        }
    };

    const displayText = selectedDate
        ? format(selectedDate, "MMMM d, yyyy")
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
                <span className={!selectedDate ? "text-slate-400" : ""}>
                    {displayText}
                </span>
                <Calendar className="absolute right-0 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </button>

            {/* Calendar Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="relative w-[95%] max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Birthdate</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Calendar */}
                        <div className="p-4">
                            <DayPicker
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleSelect}
                                captionLayout="dropdown"
                                fromYear={2000}
                                toYear={new Date().getFullYear()}
                                defaultMonth={selectedDate || new Date(2015, 0)}
                                className="mx-auto"
                                classNames={{
                                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                    month: "space-y-4",
                                    caption: "flex justify-center pt-1 relative items-center mb-4",
                                    caption_label: "text-sm font-medium hidden", // Hide when using dropdowns
                                    caption_dropdowns: "flex gap-3 justify-center",
                                    nav: "space-x-1 flex items-center",
                                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                                    nav_button_previous: "absolute left-1",
                                    nav_button_next: "absolute right-1",
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex",
                                    head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem] dark:text-slate-400",
                                    row: "flex w-full mt-2",
                                    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-100/50 [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 dark:[&:has([aria-selected].day-outside)]:bg-slate-800/50 dark:[&:has([aria-selected])]:bg-slate-800",
                                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors",
                                    day_range_end: "day-range-end",
                                    day_selected: "bg-orange-500 text-white hover:bg-orange-600 hover:text-white focus:bg-orange-500 focus:text-white dark:bg-orange-500 dark:text-white dark:hover:bg-orange-600 dark:hover:text-white dark:focus:bg-orange-500 dark:focus:text-white",
                                    day_today: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50",
                                    day_outside: "day-outside text-slate-500 opacity-50 aria-selected:bg-slate-100/50 aria-selected:text-slate-500 aria-selected:opacity-30 dark:text-slate-400 dark:aria-selected:bg-slate-800/50 dark:aria-selected:text-slate-400",
                                    day_disabled: "text-slate-500 opacity-50 dark:text-slate-400",
                                    day_range_middle: "aria-selected:bg-slate-100 aria-selected:text-slate-900 dark:aria-selected:bg-slate-800 dark:aria-selected:text-slate-50",
                                    day_hidden: "invisible",
                                    dropdown: "rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-base font-bold text-slate-900 cursor-pointer hover:border-orange-400 focus:border-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white",
                                    dropdown_month: "min-w-[120px]",
                                    dropdown_year: "min-w-[90px]",
                                }}
                            />
                        </div>

                        {/* Footer with Cancel */}
                        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full rounded-full bg-slate-100 py-2 font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
