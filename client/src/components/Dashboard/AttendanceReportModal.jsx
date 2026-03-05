import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileSpreadsheet, Download, Users, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../UI/Table';
import { cn } from '../../lib/utils';
import Portal from '../UI/Portal';

const AttendanceReportModal = ({ isOpen, onClose, className }) => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const { user } = useAuth();
    const token = user?.token;

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const fetchReport = async () => {
        if (!className) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/attendance/report/${className}`, {
                params: { month, year },
                headers: { Authorization: `Bearer ${token}` }
            });
            setReportData(data);
        } catch (error) {
            console.error('Error fetching report:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) fetchReport();
    }, [isOpen, month, year, className]);

    const handleDownload = () => {
        // Logic for CSV export could be added here
        alert("Consolidated report export functionality coming soon!");
    };

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -30 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                                        <FileSpreadsheet className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">Consolidated Attendance</h2>
                                        <p className="text-slate-500 text-sm">Class: <span className="font-bold text-indigo-600">{className}</span> • {months[month - 1]} {year}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="sm" onClick={handleDownload} className="rounded-xl gap-2 font-semibold border-slate-200">
                                        <Download className="w-4 h-4" /> Export
                                    </Button>
                                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap gap-4 items-center bg-white">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-bold text-slate-500">Month:</label>
                                    <select
                                        className="bg-slate-50 border-slate-100 text-slate-700 rounded-lg text-sm font-semibold focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5"
                                        value={month}
                                        onChange={(e) => setMonth(parseInt(e.target.value))}
                                    >
                                        {months.map((m, i) => (
                                            <option key={m} value={i + 1}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-bold text-slate-500">Year:</label>
                                    <select
                                        className="bg-slate-50 border-slate-100 text-slate-700 rounded-lg text-sm font-semibold focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5"
                                        value={year}
                                        onChange={(e) => setYear(parseInt(e.target.value))}
                                    >
                                        {[2024, 2025, 2026, 2027, 2028].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-auto p-6">
                                {loading ? (
                                    <div className="h-64 flex flex-col items-center justify-center gap-4">
                                        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                        <p className="text-slate-400 font-medium">Generating your report...</p>
                                    </div>
                                ) : reportData.length === 0 ? (
                                    <div className="h-64 flex flex-col items-center justify-center gap-3">
                                        <div className="p-4 bg-slate-50 rounded-full">
                                            <Users className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <p className="text-slate-400 font-medium text-center">No attendance data found for this class in the selected period.</p>
                                    </div>
                                ) : (
                                    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                        <Table>
                                            <TableHeader className="bg-slate-50">
                                                <TableRow>
                                                    <TableHead className="font-bold text-slate-600">Roll No</TableHead>
                                                    <TableHead className="font-bold text-slate-600">Student Name</TableHead>
                                                    <TableHead className="text-center font-bold text-slate-600">Present</TableHead>
                                                    <TableHead className="text-center font-bold text-slate-600">Absent</TableHead>
                                                    <TableHead className="text-center font-bold text-slate-600">Percentage</TableHead>
                                                    <TableHead className="text-center font-bold text-slate-600">Trend</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {reportData.map((student) => {
                                                    const percentage = parseFloat(student.percentage);
                                                    return (
                                                        <TableRow key={student.studentId} className="hover:bg-slate-50/50 transition-colors">
                                                            <TableCell className="font-mono text-xs text-slate-500">{student.rollNumber || '-'}</TableCell>
                                                            <TableCell className="font-bold text-slate-900">{student.name}</TableCell>
                                                            <TableCell className="text-center">
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                                                                    {student.present}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold">
                                                                    {student.absent}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <span className={cn(
                                                                        "text-sm font-bold",
                                                                        percentage >= 75 ? "text-emerald-600" : percentage >= 50 ? "text-amber-500" : "text-red-500"
                                                                    )}>
                                                                        {percentage}%
                                                                    </span>
                                                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={cn(
                                                                                "h-full rounded-full transition-all duration-500",
                                                                                percentage >= 75 ? "bg-emerald-500" : percentage >= 50 ? "bg-amber-400" : "bg-red-400"
                                                                            )}
                                                                            style={{ width: `${percentage}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {percentage >= 75 ? (
                                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                                                                ) : percentage < 50 ? (
                                                                    <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                                                                ) : (
                                                                    <div className="w-2 h-2 rounded-full bg-amber-400 mx-auto" />
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50/50 text-center">
                                <p className="text-xs text-slate-400 italic">Report generated on {new Date().toLocaleDateString()} • System Attendance Module v2.0</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Portal>
    );
};

export default AttendanceReportModal;
