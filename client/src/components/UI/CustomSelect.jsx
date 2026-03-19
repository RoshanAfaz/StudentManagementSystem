import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import Portal from './Portal';

const CustomSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Select option",
    className,
    label,
    required = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const menuRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, direction: 'down' });

    const selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt === value);
    const displayLabel = typeof selectedOption === 'object' ? selectedOption.label : selectedOption;

    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const menuHeight = 260; // Approximate max-height

            let direction = 'down';
            let top = rect.bottom + window.scrollY;

            if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
                direction = 'up';
                top = rect.top + window.scrollY - menuHeight - 8;
            }

            setCoords({
                top,
                left: rect.left + window.scrollX,
                width: rect.width,
                direction
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const isOutsideContainer = containerRef.current && !containerRef.current.contains(event.target);
            const isOutsideMenu = menuRef.current && !menuRef.current.contains(event.target);

            if (isOutsideContainer && isOutsideMenu) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        const val = typeof option === 'object' ? option.value : option;
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={cn("space-y-1 w-full", className)} ref={containerRef}>
            {label && (
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-indigo-300 hover:shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none",
                        isOpen && "border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm"
                    )}
                >
                    <span className={cn(!value && "text-slate-400 font-medium")}>
                        {displayLabel || placeholder}
                    </span>
                    <ChevronDown className={cn(
                        "w-4 h-4 text-slate-400 transition-transform duration-200",
                        isOpen && "rotate-180 text-indigo-500"
                    )} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <Portal>
                            <motion.div
                                ref={menuRef}
                                initial={{ opacity: 0, y: coords.direction === 'down' ? 5 : -5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: coords.direction === 'down' ? 5 : -5, scale: 0.95 }}
                                transition={{ duration: 0.1, ease: "easeOut" }}
                                style={{
                                    position: 'absolute',
                                    top: coords.direction === 'down' ? coords.top + 8 : coords.top + 8, // Adjust for the 8px offset
                                    left: coords.left,
                                    width: coords.width,
                                    zIndex: 9999
                                }}
                                className="bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 overflow-hidden max-h-64 overflow-y-auto backdrop-blur-xl"
                            >
                                {options.map((option, idx) => {
                                    const val = typeof option === 'object' ? option.value : option;
                                    const label = typeof option === 'object' ? option.label : option;
                                    const isSelected = val === value;

                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSelect(option)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-5 py-3 text-sm transition-colors text-left border-b border-gray-50 last:border-0",
                                                isSelected
                                                    ? "bg-indigo-50 text-indigo-700 font-bold"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                                            )}
                                        >
                                            <span>{label}</span>
                                            {isSelected && <Check className="w-5 h-5 text-indigo-600" />}
                                        </button>
                                    );
                                })}
                                {options.length === 0 && (
                                    <div className="px-4 py-8 text-center text-slate-400 text-xs italic">
                                        No options available
                                    </div>
                                )}
                            </motion.div>
                        </Portal>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CustomSelect;
