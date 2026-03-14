import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BarChart3, 
    Calendar, 
    Download, 
    FileSpreadsheet, 
    Filter, 
    Search,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    CheckCircle2,
    XCircle,
    Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Label } from '../components/UI/Label';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/UI/Table';
import ClassSelector from '../components/UI/ClassSelector';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';
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
    LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const AttendanceReportDashboard = () => {
    const { user } = useAuth();
    const token = user?.token;

    const [loading, setLoading] = useState(false);
    const [className, setClassName] = useState('');
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportData, setReportData] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        percentage: 0
    });

    const fetchReport = async () => {
        if (!className) return;
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { className, startDate, endDate }
            };
            const { data } = await axios.get('/api/attendance/advanced-report', config);
            
            // Process data for display
            processData(data);
        } catch (error) {
            console.error('Error fetching advanced report:', error);
        }
        setLoading(false);
    };

    const processData = (data) => {
        // Consolidated student report
        const studentMap = {};
        let totalP = 0;
        let totalA = 0;

        data.forEach(record => {
            const sId = record.student._id;
            if (!studentMap[sId]) {
                studentMap[sId] = {
                    name: record.student.user.name,
                    studentId: record.student.user.studentId,
                    present: 0,
                    absent: 0,
                    total: 0
                };
            }
            studentMap[sId].total++;
            if (record.status === 'Present') {
                studentMap[sId].present++;
                totalP++;
            } else {
                studentMap[sId].absent++;
                totalA++;
            }
        });

        const consolidated = Object.values(studentMap).map(s => ({
            ...s,
            percentage: ((s.present / s.total) * 100).toFixed(1)
        }));

        setReportData(consolidated);
        setStats({
            total: data.length,
            present: totalP,
            absent: totalA,
            percentage: data.length > 0 ? ((totalP / data.length) * 100).toFixed(1) : 0
        });
    };

    useEffect(() => {
        if (className) fetchReport();
    }, [className]);

    const exportToExcel = () => {
        if (reportData.length === 0) return;

        const worksheet = XLSX.utils.json_to_sheet(reportData.map(s => ({
            'Student Name': s.name,
            'Student ID': s.studentId,
            'Days Present': s.present,
            'Days Absent': s.absent,
            'Total Days': s.total,
            'Attendance %': s.percentage + '%'
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");
        
        // Generate filename
        const filename = `Attendance_Report_${className}_${startDate}_to_${endDate}.xlsx`;
        XLSX.writeFile(workbook, filename);
    };

    // Chart Data
    const barChartData = {
        labels: reportData.slice(0, 10).map(s => s.name),
        datasets: [
            {
                label: 'Present Days',
                data: reportData.slice(0, 10).map(s => s.present),
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderRadius: 8,
            },
            {
                label: 'Absent Days',
                data: reportData.slice(0, 10).map(s => s.absent),
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderRadius: 8,
            }
        ]
    };

    const pieData = {
        labels: ['Present', 'Absent'],
        datasets: [{
            data: [stats.present, stats.absent],
            backgroundColor: ['#10b981', '#ef4444'],
            hoverOffset: 4
        }]
    };

    return (
        <div className="p-4 sm:p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Attendance Analytics</h1>
                    <p className="text-slate-500 font-medium">Detailed insights and reporting for student attendance.</p>
                </motion.div>

                <div className="flex items-center gap-3">
                    <Button 
                        onClick={exportToExcel} 
                        disabled={reportData.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 shadow-lg shadow-indigo-100 transition-all font-bold gap-2"
                    >
                        <FileSpreadsheet className="w-5 h-5" /> Export to Excel
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white/50 backdrop-blur-md border border-white">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Class</Label>
                            <ClassSelector 
                                value={className} 
                                onChange={setClassName}
                                className="rounded-xl border-slate-200 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</Label>
                            <Input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)}
                                className="rounded-xl border-slate-200 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">End Date</Label>
                            <Input 
                                type="date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)}
                                className="rounded-xl border-slate-200 focus:ring-indigo-500"
                            />
                        </div>
                        <Button 
                            onClick={fetchReport} 
                            disabled={loading || !className}
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 font-bold gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Filter className="w-5 h-5" />}
                            Generate Report
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Attendance" 
                    value={stats.total} 
                    icon={<Users className="w-6 h-6" />}
                    color="bg-blue-600"
                    trend={null}
                />
                <StatCard 
                    title="Present Count" 
                    value={stats.present} 
                    icon={<CheckCircle2 className="w-6 h-6" />}
                    color="bg-emerald-600"
                    trend={<span className="text-emerald-500 flex items-center text-xs font-bold"><ArrowUpRight className="w-3 h-3" /> Average</span>}
                />
                <StatCard 
                    title="Absent Count" 
                    value={stats.absent} 
                    icon={<XCircle className="w-6 h-6" />}
                    color="bg-rose-600"
                    trend={<span className="text-rose-500 flex items-center text-xs font-bold"><ArrowDownRight className="w-3 h-3" /> Warning</span>}
                />
                <StatCard 
                    title="Overall Percentage" 
                    value={`${stats.percentage}%`} 
                    icon={<BarChart3 className="w-6 h-6" />}
                    color="bg-indigo-600"
                    trend={null}
                />
            </div>

            {/* Visuals and Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Charts */}
                <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-slate-100">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-600" /> Attendance Comparison
                        </CardTitle>
                        <CardDescription>Visual breakdown of top 10 students by attendance status.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {reportData.length > 0 ? (
                            <Bar 
                                data={barChartData} 
                                options={{ 
                                    responsive: true, 
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom' } },
                                    scales: { y: { beginAtZero: true } }
                                }} 
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 italic">No data to display</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-slate-100">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-600" /> Distribution
                        </CardTitle>
                        <CardDescription>Present vs Absent ratio.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                         {reportData.length > 0 ? (
                             <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
                         ) : (
                             <div className="text-slate-400 italic">No data</div>
                         )}
                    </CardContent>
                    <CardFooter className="flex-col gap-2 pt-0 pb-6 items-start px-6">
                        <div className="flex items-center gap-2 w-full">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-sm font-medium text-slate-600 flex-1">Present Rate</span>
                            <span className="text-sm font-bold text-slate-900">{stats.percentage}%</span>
                        </div>
                        <div className="flex items-center gap-2 w-full">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <span className="text-sm font-medium text-slate-600 flex-1">Absent Rate</span>
                            <span className="text-sm font-bold text-slate-900">{(100 - stats.percentage).toFixed(1)}%</span>
                        </div>
                    </CardFooter>
                </Card>

                {/* Detailed Table */}
                <Card className="lg:col-span-3 border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
                        <div>
                            <CardTitle className="text-xl font-bold">Consolidated Student Records</CardTitle>
                            <CardDescription>Detailed attendance metrics for each student in the selected period.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {reportData.length > 0 ? (
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow>
                                        <TableHead className="font-bold text-slate-600 w-16">ID</TableHead>
                                        <TableHead className="font-bold text-slate-600">Student Name</TableHead>
                                        <TableHead className="text-center font-bold text-slate-600">Present</TableHead>
                                        <TableHead className="text-center font-bold text-slate-600">Absent</TableHead>
                                        <TableHead className="text-center font-bold text-slate-600">Total Days</TableHead>
                                        <TableHead className="text-center font-bold text-slate-600">Percentage</TableHead>
                                        <TableHead className="text-right pr-8 font-bold text-slate-600">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {reportData.map((row, idx) => (
                                            <motion.tr 
                                                key={row.studentId}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="hover:bg-slate-50/50 transition-colors"
                                            >
                                                <TableCell className="font-mono text-xs text-slate-400">{row.studentId}</TableCell>
                                                <TableCell className="font-bold text-slate-900">{row.name}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                                                        {row.present}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="inline-block px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold">
                                                        {row.absent}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center font-medium text-slate-600">{row.total}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={cn(
                                                            "text-sm font-bold",
                                                            row.percentage >= 75 ? "text-emerald-600" : row.percentage >= 50 ? "text-amber-500" : "text-rose-500"
                                                        )}>
                                                            {row.percentage}%
                                                        </span>
                                                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className={cn(
                                                                    "h-full rounded-full transition-all duration-500",
                                                                    row.percentage >= 75 ? "bg-emerald-500" : row.percentage >= 50 ? "bg-amber-400" : "bg-rose-400"
                                                                )}
                                                                style={{ width: `${row.percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    {row.percentage >= 75 ? (
                                                        <span className="text-emerald-600 text-xs font-bold flex items-center justify-end gap-1"><CheckCircle2 className="w-4 h-4" /> Good</span>
                                                    ) : row.percentage < 50 ? (
                                                        <span className="text-rose-600 text-xs font-bold flex items-center justify-end gap-1"><XCircle className="w-4 h-4" /> Critical</span>
                                                    ) : (
                                                        <span className="text-amber-600 text-xs font-bold flex items-center justify-end gap-1">Average</span>
                                                    )}
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                                <Search className="w-12 h-12 text-slate-200" />
                                <p className="font-medium">Please select a class and click generate to view data.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, trend }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6 relative overflow-hidden group"
    >
        <div className={`p-4 rounded-2xl ${color} text-white shadow-lg transition-transform group-hover:scale-110 duration-300`}>
            {icon}
        </div>
        <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{title}</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
            {trend && <div className="mt-1">{trend}</div>}
        </div>
        <div className="absolute top-0 right-0 p-2 opacity-5">
            {icon}
        </div>
    </motion.div>
);

const CardFooter = ({ children, className }) => (
    <div className={cn("p-4 flex items-center", className)}>
        {children}
    </div>
);

export default AttendanceReportDashboard;
