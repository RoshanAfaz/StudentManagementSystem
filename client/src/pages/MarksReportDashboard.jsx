import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    FileSpreadsheet,
    Download,
    Users,
    CheckCircle2,
    XCircle,
    Loader2,
    BookOpen,
    Trophy,
    TrendingUp,
    Target,
    Award,
    ChevronDown,
    Search
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Label } from '../components/UI/Label';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/UI/Table';
import ClassSelector from '../components/UI/ClassSelector';
import CustomSelect from '../components/UI/CustomSelect';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';
import { downloadFile } from '../lib/downloadHelper';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    RadialLinearScale
} from 'chart.js';
import { Bar, Radar, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    RadialLinearScale
);

const MarksReportDashboard = () => {
    const { user } = useAuth();
    const token = user?.token;

    const [loading, setLoading] = useState(false);
    const [className, setClassName] = useState('');
    const [examType, setExamType] = useState('');
    const reportRef = useRef(null);
    const [examTypes, setExamTypes] = useState(['Midterm', 'Final', 'Quarterly', 'Half Yearly', 'Unit Test', 'CAT 1', 'CAT 2']);
    const [reportData, setReportData] = useState([]);
    const [subjectStats, setSubjectStats] = useState([]);
    const [overview, setOverview] = useState({
        totalStudents: 0,
        averagePercentage: 0,
        highestMarks: 0,
        passingStudents: 0
    });

    useEffect(() => {
        const fetchExamTypes = async () => {
            try {
                const { data } = await axios.get('/api/marks/exam-types', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const defaults = ['Midterm', 'Final', 'Quarterly', 'Half Yearly', 'Unit Test', 'CAT 1', 'CAT 2'];

                if (data && data.length > 0) {
                    // Combine database types with defaults, removing duplicates (case-insensitive)
                    const combined = [...data];
                    defaults.forEach(def => {
                        if (!combined.some(c => c.toLowerCase() === def.toLowerCase())) {
                            combined.push(def);
                        }
                    });
                    setExamTypes(combined);
                } else {
                    setExamTypes(defaults);
                }
            } catch (error) {
                console.error('Error fetching exam types:', error);
                // Keep the original defaults set in useState if fetch fails
            }
        };
        if (token) fetchExamTypes();
    }, [token]);

    const fetchReport = async () => {
        if (!className) return;
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { className, examType }
            };
            const { data } = await axios.get('/api/marks/advanced-report', config);
            processMarksData(data);
        } catch (error) {
            console.error('Error fetching advanced marks report:', error);
        }
        setLoading(false);
    };

    const processMarksData = (data) => {
        if (data.length === 0) {
            setReportData([]);
            setOverview({ totalStudents: 0, averagePercentage: 0, highestMarks: 0, passingStudents: 0 });
            return;
        }

        const studentPerformance = data.map(record => {
            const percentage = ((record.grandTotalObtained / record.grandTotalMax) * 100).toFixed(1);
            // Student passes only if they exceed passMarks in EVERY subject
            const hasFailedAny = record.subjects.some(sub => sub.marksObtained < (sub.passMarks || 35));

            return {
                id: record.student._id,
                name: record.student.user.name,
                studentId: record.student.user.studentId,
                totalObtained: record.grandTotalObtained,
                totalMax: record.grandTotalMax,
                percentage: parseFloat(percentage),
                subjects: record.subjects,
                examType: record.examType,
                status: hasFailedAny ? 'Fail' : 'Pass'
            };
        });

        // Subject-wise averages
        const subjectsMap = {};
        data.forEach(record => {
            record.subjects.forEach(sub => {
                if (!subjectsMap[sub.subjectName]) {
                    subjectsMap[sub.subjectName] = { totalObtained: 0, totalMax: 0, count: 0 };
                }
                subjectsMap[sub.subjectName].totalObtained += sub.marksObtained;
                subjectsMap[sub.subjectName].totalMax += sub.maxMarks;
                subjectsMap[sub.subjectName].count++;
            });
        });

        const subjectAverages = Object.entries(subjectsMap).map(([name, stats]) => ({
            name,
            average: ((stats.totalObtained / stats.totalMax) * 100).toFixed(1)
        }));

        setReportData(studentPerformance);
        setSubjectStats(subjectAverages);

        const totalPercentage = studentPerformance.reduce((acc, s) => acc + s.percentage, 0);
        setOverview({
            totalStudents: studentPerformance.length,
            averagePercentage: (totalPercentage / studentPerformance.length).toFixed(1),
            highestMarks: Math.max(...studentPerformance.map(s => s.percentage)),
            passingStudents: studentPerformance.filter(s => s.status === 'Pass').length
        });
    };

    useEffect(() => {
        if (className) fetchReport();
    }, [className, examType]);

    const exportToExcel = async () => {
        if (reportData.length === 0) return;

        const excelData = reportData.map(s => {
            const row = {
                'Student Name': s.name,
                'Student ID': s.studentId,
                'Exam': s.examType,
                'Total Marks': s.totalObtained,
                'Max Marks': s.totalMax,
                'Percentage': s.percentage + '%',
                'Status': s.status
            };
            s.subjects.forEach(sub => {
                row[sub.subjectName] = `${sub.marksObtained}/${sub.maxMarks}`;
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Marks Report");
        const filename = `Marks_Report_${className}_${examType || 'All'}.xlsx`;
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
        await downloadFile(wbout, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    };

    const downloadPDF = () => {
        if (!reportRef.current) return;

        const element = reportRef.current;
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `Marks_Report_${className}_${examType || 'All'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        html2pdf().set(opt).from(element).output('blob').then(async (pdfBlob) => {
            await downloadFile(pdfBlob, opt.filename, 'application/pdf');
        });
    };

    // Chart Data
    const barData = {
        labels: subjectStats.map(s => s.name),
        datasets: [{
            label: 'Subject Average (%)',
            data: subjectStats.map(s => s.average),
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
            borderColor: 'rgb(99, 102, 241)',
            borderWidth: 1,
            borderRadius: 8
        }]
    };

    const topStudentsData = {
        labels: reportData.sort((a, b) => b.percentage - a.percentage).slice(0, 5).map(s => s.name),
        datasets: [{
            label: 'Top Performers (%)',
            data: reportData.sort((a, b) => b.percentage - a.percentage).slice(0, 5).map(s => s.percentage),
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderRadius: 8
        }]
    };

    return (
        <div className="p-4 sm:p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Academic Analytics</h1>
                    <p className="text-slate-500 font-medium">Performance tracking and grade distribution reports.</p>
                </motion.div>

                <div className="flex gap-3">
                    <Button
                        onClick={exportToExcel}
                        disabled={reportData.length === 0}
                        variant="outline"
                        className="rounded-xl px-4 font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-2"
                    >
                        <FileSpreadsheet className="w-5 h-5 text-indigo-500" /> Excel
                    </Button>
                    <Button
                        onClick={downloadPDF}
                        disabled={reportData.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 shadow-lg shadow-emerald-100 font-bold gap-2"
                    >
                        <Download className="w-5 h-5" /> Download PDF
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-none shadow-sm rounded-3xl bg-white/50 backdrop-blur-md border border-white">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class</Label>
                            <ClassSelector value={className} onChange={setClassName} />
                        </div>
                        <div className="space-y-2">
                            <CustomSelect
                                label="Exam Type"
                                options={["", ...examTypes].map(type => ({
                                    label: type || "All Exams",
                                    value: type
                                }))}
                                value={examType}
                                onChange={setExamType}
                                placeholder="All Exams"
                            />
                        </div>
                        <Button
                            onClick={fetchReport}
                            disabled={loading || !className}
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 font-bold gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                            Analyze Performance
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div ref={reportRef} className="space-y-8 bg-slate-50 p-2 md:p-4 rounded-3xl">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Students" value={overview.totalStudents} icon={<Users />} color="bg-indigo-600" />
                    <StatCard title="Class Average" value={`${overview.averagePercentage}%`} icon={<Target />} color="bg-blue-600" />
                    <StatCard title="Highest Score" value={`${overview.highestMarks}%`} icon={<Trophy />} color="bg-amber-500" />
                    <StatCard title="Pass Percentage" value={`${((overview.passingStudents / (overview.totalStudents || 1)) * 100).toFixed(1)}%`} icon={<CheckCircle2 />} color="bg-emerald-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Subject Performance */}
                    <Card className="border-none shadow-sm rounded-3xl bg-white border border-slate-100">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-600" /> Subject-wise Averages
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            {subjectStats.length > 0 ? (
                                <Bar
                                    data={barData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: { y: { beginAtZero: true, max: 100 } }
                                    }}
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Performers */}
                    <Card className="border-none shadow-sm rounded-3xl bg-white border border-slate-100">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-500" /> Top Performers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            {reportData.length > 0 ? (
                                <Bar
                                    data={topStudentsData}
                                    options={{
                                        indexAxis: 'y',
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: { x: { beginAtZero: true, max: 100 } }
                                    }}
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Marks Table */}
                    <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-slate-100">
                        <CardHeader className="border-b border-slate-50">
                            <CardTitle className="text-xl font-bold">Consolidated Marks List</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            {reportData.length > 0 ? (
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow>
                                            <TableHead className="font-bold text-slate-600">Student Name</TableHead>
                                            <TableHead className="text-center font-bold text-slate-600">Exam</TableHead>
                                            <TableHead className="text-center font-bold text-slate-600">Total Marks</TableHead>
                                            <TableHead className="text-center font-bold text-slate-600">Percentage</TableHead>
                                            <TableHead className="text-right pr-8 font-bold text-slate-600">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((row) => (
                                            <TableRow key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="font-bold text-slate-900">
                                                    <div className="flex flex-col">
                                                        <span>{row.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">ID: {row.studentId}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-medium text-slate-600">{row.examType}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-bold text-slate-700">{row.totalObtained}</span>
                                                    <span className="text-slate-400">/{row.totalMax}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={cn(
                                                            "text-sm font-bold",
                                                            row.percentage >= 75 ? "text-emerald-600" : row.percentage >= 40 ? "text-amber-500" : "text-rose-500"
                                                        )}>
                                                            {row.percentage}%
                                                        </span>
                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={cn(
                                                                    "h-full rounded-full",
                                                                    row.percentage >= 75 ? "bg-emerald-500" : row.percentage >= 40 ? "bg-amber-400" : "bg-rose-400"
                                                                )}
                                                                style={{ width: `${row.percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-tighter shadow-sm",
                                                        row.status === 'Pass'
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                            : "bg-rose-50 text-rose-700 border-rose-100"
                                                    )}>
                                                        {row.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                                    <Search className="w-12 h-12 text-slate-200" />
                                    <p className="font-medium">Please select a class to view metrics.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6 relative overflow-hidden group">
        <div className={`p-4 rounded-2xl ${color} text-white shadow-lg transition-transform group-hover:scale-110 duration-300`}>
            {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
        <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
        </div>
    </div>
);

export default MarksReportDashboard;
