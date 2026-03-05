import React, { useState, useEffect } from 'react';
import { Label } from './Label';

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
            <div className="flex gap-2">
                <select
                    value={grade}
                    onChange={handleGradeChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required={required}
                >
                    <option value="">Grade</option>
                    {GRADES.map(g => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>
                <select
                    value={section}
                    onChange={handleSectionChange}
                    className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required={required}
                >
                    <option value="">Sec/Stream</option>
                    {SECTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                {section === 'Other' && (
                    <input
                        type="text"
                        value={customSection}
                        onChange={handleCustomSectionChange}
                        placeholder="CUSTOM"
                        className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 uppercase"
                        required={required}
                        maxLength={6}
                    />
                )}
            </div>
        </div>
    );
};

export default ClassSelector;
