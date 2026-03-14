import React, { useState, useEffect } from 'react';
import { Label } from './Label';
import CustomSelect from './CustomSelect';

const GRADES = ['Pre-KG', 'LKG', 'UKG', ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
// Standard sections + common streams + Other option
const SECTIONS = [
    ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)), // A-Z
    'BIO', 'CS', 'COMM', 'ARTS', 'SCI',
    'Other'
];

const ClassSelector = ({ value, onChange, label = "Class", required = false }) => {
    const [grade, setGrade] = useState('');
    const [section, setSection] = useState('');
    const [customSection, setCustomSection] = useState('');

    // Parse initial value
    useEffect(() => {
        if (value) {
            const parts = value.split('-');
            if (parts.length >= 2) {
                const g = parts[0];
                const s = parts.slice(1).join('-'); // Join back in case section has hyphens

                setGrade(g);
                if (SECTIONS.includes(s)) {
                    setSection(s);
                    setCustomSection('');
                } else {
                    setSection('Other');
                    setCustomSection(s);
                }
            } else {
                setGrade(value);
                setSection('');
            }
        } else {
            setGrade('');
            setSection('');
            setCustomSection('');
        }
    }, [value]);

    const handleGradeChange = (e) => {
        const newGrade = e.target.value;
        setGrade(newGrade);
        updateParent(newGrade, section, customSection);
    };

    const handleSectionChange = (e) => {
        const newSection = e.target.value;
        setSection(newSection);
        if (newSection !== 'Other') {
            setCustomSection(''); // Clear custom if switching back to standard
            updateParent(grade, newSection, '');
        } else {
            // Don't update parent with just "Other", wait for raw input
            updateParent(grade, 'Other', customSection);
        }
    };

    const handleCustomSectionChange = (e) => {
        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Uppercase + Alphanumeric only
        setCustomSection(val);
        updateParent(grade, 'Other', val);
    };

    const updateParent = (g, s, cs) => {
        const finalSection = s === 'Other' ? cs : s;

        if (g && finalSection) {
            onChange(`${g}-${finalSection}`);
        } else if (g) {
            onChange(`${g}-${finalSection}`);
        } else {
            onChange('');
        }
    };

    return (
        <div className="space-y-1">
            <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
            <div className="flex gap-3 items-end">
                <CustomSelect
                    label="Grade"
                    options={GRADES}
                    value={grade}
                    onChange={(val) => {
                        setGrade(val);
                        updateParent(val, section, customSection);
                    }}
                    placeholder="Grade"
                    className="flex-1"
                />

                <CustomSelect
                    label="Sec/Stream"
                    options={SECTIONS}
                    value={section}
                    onChange={(val) => {
                        setSection(val);
                        if (val !== 'Other') {
                            setCustomSection('');
                            updateParent(grade, val, '');
                        } else {
                            updateParent(grade, 'Other', customSection);
                        }
                    }}
                    placeholder="Sec/Stream"
                    className="w-36"
                />

                {section === 'Other' && (
                    <div className="space-y-1">
                        <Label>Custom</Label>
                        <input
                            type="text"
                            value={customSection}
                            onChange={handleCustomSectionChange}
                            placeholder="CUSTOM"
                            className="flex h-11 w-24 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:border-indigo-300 hover:shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none uppercase"
                            required={required}
                            maxLength={6}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassSelector;
