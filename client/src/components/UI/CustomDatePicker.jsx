import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button } from './Button';

const CustomDatePicker = ({ selectedDate, onChange, label = "Select Date" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date(selectedDate || new Date()));
    const containerRef = useRef(null);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onChange(newDate.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const renderDays = () => {
        const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
        const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
        const days = [];

        // Empty slots for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const isSelected = selectedDate === new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toISOString().split('T')[0];
            const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toDateString();

            days.push(
                <motion.button
                    key={d}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDateSelect(d)}
                    className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center text-sm transition-colors",
                        isSelected ? "bg-indigo-600 text-white font-bold" :
                            isToday ? "bg-indigo-50 text-indigo-600 border border-indigo-200" :
                                "hover:bg-slate-100 text-slate-700"
                    )}
                >
                    {d}
                </motion.button>
            );
        }
        return days;
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    return (
        <div className="relative" ref={containerRef}>
            {label && <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{label}</label>}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 hover:ring-4 hover:ring-indigo-50 transition-all text-slate-700 w-full lg:w-48 text-left"
            >
                <CalendarIcon className="w-4 h-4 text-indigo-500" />
                <span className="flex-1 font-medium">{selectedDate || "Select Date"}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute left-0 mt-2 p-4 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] w-72"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 hover:bg-slate-100">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <div className="flex flex-col items-center">
                                <span className="font-bold text-slate-900">{months[viewDate.getMonth()]}</span>
                                <select
                                    className="text-xs text-slate-500 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-indigo-600"
                                    value={viewDate.getFullYear()}
                                    onChange={(e) => setViewDate(new Date(parseInt(e.target.value), viewDate.getMonth(), 1))}
                                >
                                    {Array.from({ length: 21 }, (_, i) => currentYear - 10 + i).map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>

                            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 hover:bg-slate-100">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Weekdays */}
                        <div className="grid grid-cols-7 mb-2">
                            {daysOfWeek.map(day => (
                                <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {renderDays()}
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date().toISOString().split('T')[0];
                                    onChange(today);
                                    setIsOpen(false);
                                }}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-xs font-bold text-slate-400 hover:text-slate-600"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomDatePicker;
