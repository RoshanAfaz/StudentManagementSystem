import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import EventSection from '../components/Dashboard/EventSection';
import AddEventForm from '../components/Dashboard/AddEventForm';
import useEventBadge from '../hooks/useEventBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/UI/Tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/UI/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/UI/Table';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Label } from '../components/UI/Label';
import ClassSelector from '../components/UI/ClassSelector';
import CustomSelect from '../components/UI/CustomSelect';
import { motion, AnimatePresence } from 'framer-motion';
import Portal from '../components/UI/Portal';
import { Plus, Upload, Check, X, FileSpreadsheet, UserPlus, Save, BarChart3, RotateCcw, ChevronDown } from 'lucide-react';
import CustomDatePicker from '../components/UI/CustomDatePicker';
import AttendanceReportModal from '../components/Dashboard/AttendanceReportModal';
import { cn } from '../lib/utils';

const TeacherDashboard = () => {
    const [activeTab, setActiveTab] = useState('students');
    const { hasUnread, markRead } = useEventBadge();
    const location = useLocation();
    const navigate = useNavigate();

    // Sync URL path with activeTab
    useEffect(() => {
        if (location.pathname.includes('/attendance')) setActiveTab('attendance');
        else if (location.pathname.includes('/marks')) setActiveTab('marks');
        else if (location.pathname.includes('/timetable')) setActiveTab('timetable');
        else if (location.pathname.includes('/events')) {
            setActiveTab('events');
            markRead();
        }
        else setActiveTab('students');
    }, [location]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'events') markRead();
        if (tab === 'students') navigate('/teacher/dashboard');
        else navigate(`/teacher/${tab}`);
    };
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI States
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showEditStudent, setShowEditStudent] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [formData, setFormData] = useState({});
    const [bulkFile, setBulkFile] = useState(null);

    // Attendance State
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceStatus, setAttendanceStatus] = useState({});

    // Marks State
    const [selectedStudent, setSelectedStudent] = useState('');
    const [viewingStudent, setViewingStudent] = useState(null);
    const [examType, setExamType] = useState('');
    const [subjectsList, setSubjectsList] = useState([{ subjectName: '', marksObtained: '', maxMarks: '', passMarks: '35' }]);
    const [msg, setMsg] = useState('');
    const [studentMarks, setStudentMarks] = useState([]); // Store marks for viewed student
    const [showReport, setShowReport] = useState(false);
    const [selectedClassName, setSelectedClassName] = useState('');

    const [timetableClass, setTimetableClass] = useState('');
    const [timetableType, setTimetableType] = useState('image'); // 'image' or 'manual'
    const [timetableFile, setTimetableFile] = useState(null);
    const [numPeriods, setNumPeriods] = useState(5);
    const [selectedDays, setSelectedDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    const [manualSchedule, setManualSchedule] = useState({});

    // Initialize schedule when days/periods change, but try to preserve existing data
    useEffect(() => {
        const newSchedule = {};
        selectedDays.forEach(day => {
            // Preserve existing data if available, otherwise fill with empty strings
            const existingDay = manualSchedule[day] || [];
            newSchedule[day] = Array(numPeriods).fill('').map((_, i) => existingDay[i] || '');
        });
        setManualSchedule(newSchedule);
    }, [numPeriods, selectedDays, timetableClass]); // Re-init when class changes effectively resets, but we might want to load getting manualSchedule from backend instead. 

    // Correct logic: When loading a class, we set manualSchedule from backend. 
    // This effect should only run when user MANUALLY changes config, or initially.
    // Let's separate the "Initialize empty" from "Update config".

    // Actually, simpler approach: 
    // 1. Have a function `generateEmptySchedule(days, periods)`
    // 2. When backend data loads, update `numPeriods` and `selectedDays` based on it.

    const [currentTimetable, setCurrentTimetable] = useState(null);

    const { user } = useAuth();
    const token = user?.token;

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const fetchStudentMarks = async (studentId) => {
        try {
            const { data } = await axios.get(`/api/marks/student/${studentId}`, config);
            setStudentMarks(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get('/api/students', { ...config, timeout: 5000 });
            setStudents(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setMsg('Failed to fetch students');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleValidChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/students', formData, config);
            setMsg('Student added successfully');
            setShowAddStudent(false);
            fetchStudents();
            setFormData({});
        } catch (error) {
            setMsg(error.response?.data?.message || 'Error adding student');
        }
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!bulkFile) return;
        const data = new FormData();
        data.append('file', bulkFile);
        try {
            await axios.post('/api/students/bulk', data, {
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });
            setShowBulkUpload(false);
            fetchStudents();
            setMsg('Bulk upload successful');
        } catch (error) {
            setMsg('Bulk upload failed');
        }
    };

    const handleEditStudent = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/students/${formData._id}`, formData, config);
            setShowEditStudent(false);
            fetchStudents();
            setMsg('Student updated successfully');
        } catch (error) {
            setMsg('Error updating student');
        }
    };

    const handleAddSubjectField = () => {
        setSubjectsList([...subjectsList, { subjectName: '', marksObtained: '', maxMarks: '', passMarks: '35' }]);
    };

    const handleRemoveSubjectField = (index) => {
        const list = [...subjectsList];
        list.splice(index, 1);
        setSubjectsList(list);
    };

    const handleSubjectChange = (index, field, value) => {
        const list = [...subjectsList];
        list[index][field] = value;
        setSubjectsList(list);
    };

    const handleMarksSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/marks', {
                studentId: selectedStudent,
                examType,
                subjects: subjectsList
            }, config);
            setMsg('Marks added successfully');
            setSubjectsList([{ subjectName: '', marksObtained: '', maxMarks: '', passMarks: '35' }]);
            setExamType('');
            setSelectedStudent('');
        } catch (error) {
            setMsg('Error adding marks');
        }
    };

    const handleBulkAttendanceSave = async () => {
        const attendanceData = Object.entries(attendanceStatus).map(([studentId, status]) => ({
            studentId,
            status
        }));

        if (attendanceData.length === 0) return setMsg('Please mark at least one student');

        setLoading(true);
        try {
            await axios.post('/api/attendance/bulk', {
                attendanceData,
                date: attendanceDate
            }, config);
            setMsg('Attendance saved successfully!');
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            setMsg('Error saving attendance');
        }
        setLoading(false);
    };

    const resetAttendance = () => {
        if (window.confirm("Clear all selections?")) {
            setAttendanceStatus({});
        }
    };

    const markAllPresent = () => {
        const newStatus = {};
        students.forEach(s => newStatus[s._id] = 'Present');
        setAttendanceStatus(newStatus);
    };

    // Fetch timetable when class is selected
    useEffect(() => {
        if (!timetableClass) {
            setCurrentTimetable(null);
            return;
        }

        const fetchTimetable = async () => {
            try {
                const res = await axios.get(`/api/timetable/${timetableClass}`, config);
                setCurrentTimetable(res.data);

                if (res.data.type === 'manual' && res.data.schedule) {
                    // Infer configuration from fetched data
                    const days = Object.keys(res.data.schedule);
                    if (days.length > 0) {
                        setSelectedDays(days);
                        setNumPeriods(res.data.schedule[days[0]].length);
                        setManualSchedule(res.data.schedule);
                        setTimetableType('manual');
                    }
                } else {
                    // Reset to defaults if no manual timetable exists
                    setNumPeriods(5);
                    setSelectedDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
                    setTimetableType(res.data.type || 'image');
                }
            } catch (error) {
                setCurrentTimetable(null);
                // Reset defaults
                setNumPeriods(5);
                setSelectedDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
                setManualSchedule({
                    Monday: Array(5).fill(''),
                    Tuesday: Array(5).fill(''),
                    Wednesday: Array(5).fill(''),
                    Thursday: Array(5).fill(''),
                    Friday: Array(5).fill('')
                });
            }
        };

        fetchTimetable();
    }, [timetableClass, token]);

    const handleTimetableSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('className', timetableClass);
            formData.append('type', timetableType);

            if (timetableType === 'image') {
                if (!timetableFile) return setMsg('Please select an image');
                formData.append('image', timetableFile);
            } else {
                formData.append('schedule', JSON.stringify(manualSchedule));
            }

            await axios.post('/api/timetable', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setMsg('Timetable saved successfully!');
            // Refresh
            const res = await axios.get(`/api/timetable/${timetableClass}`, config);
            setCurrentTimetable(res.data);
        } catch (error) {
            console.error(error);
            setMsg('Error saving timetable');
        }
    };

    const handleManualScheduleChange = (day, index, value) => {
        const newSchedule = { ...manualSchedule };
        newSchedule[day][index] = value;
        setManualSchedule(newSchedule);
    };

    const handleConfigChange = (newDays, newPeriods) => {
        setSelectedDays(newDays);
        setNumPeriods(newPeriods);
        // useEffect will handle manualSchedule update
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading teacher dashboard...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 md:p-8 text-white shadow-xl mb-4 md:mb-8"
            >
                <div className="relative z-10">
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight mb-2 text-center md:text-left">Welcome Back, {user?.name || 'Teacher'}</h1>
                    <p className="text-emerald-100 text-sm md:text-base max-w-xl text-center md:text-left">
                        Your classroom management hub. Check attendance, manage marks, and stay updated with school events.
                    </p>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl hidden md:block"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-white/10 blur-2xl hidden md:block"></div>
            </motion.div>

            <div className="hidden">
                <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
            </div>

            {msg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-3 rounded-md text-sm font-medium ${msg.includes('Error') || msg.includes('failed') ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700'}`}>
                    {msg}
                </motion.div>
            )}

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto pb-4 -mb-4 no-scrollbar">
                    <TabsList className="flex w-fit lg:grid lg:w-full lg:grid-cols-5 min-w-max lg:min-w-0 bg-white/50 backdrop-blur-md shadow-lg p-1.5 border-white/50 rounded-2xl">
                        <TabsTrigger value="students" className="rounded-xl px-8 lg:px-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">My Students</TabsTrigger>
                        <TabsTrigger value="attendance" className="rounded-xl px-8 lg:px-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">Attendance</TabsTrigger>
                        <TabsTrigger value="marks" className="rounded-xl px-8 lg:px-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">Marks</TabsTrigger>
                        <TabsTrigger value="timetable" className="rounded-xl px-8 lg:px-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">Timetable</TabsTrigger>
                        <TabsTrigger value="events" className="relative rounded-xl px-8 lg:px-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
                            Events
                            {hasUnread && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
                            {hasUnread && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="mt-6">
                    <TabsContent value="students" className="mt-0">
                        <Card glass className="border-0 shadow-lg p-3 md:p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800">Students Directory</h2>
                                    <p className="text-slate-500 text-xs md:text-sm font-medium">Manage and monitor student records.</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            {students.length} Students
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                    <Button variant="outline" size="icon" onClick={fetchStudents} title="Reload list" className="rounded-xl h-9 w-9">
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                    <Button variant="premium" onClick={() => setShowAddStudent(true)} className="rounded-xl h-9 text-xs flex-1 md:flex-none">
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Add
                                    </Button>
                                    <Button variant="glass" onClick={() => setShowBulkUpload(true)} className="rounded-xl h-9 text-xs flex-1 md:flex-none text-slate-700 font-bold">
                                        <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                                        Bulk
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow border overflow-hidden">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="hidden sm:table-cell">Roll No</TableHead>
                                                <TableHead>Student Name</TableHead>
                                                <TableHead className="hidden lg:table-cell">ID</TableHead>
                                                <TableHead className="hidden md:table-cell">Class</TableHead>
                                                <TableHead className="hidden sm:table-cell">Parent Contact</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {students.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                                        No students found in your assigned classes.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                students.map((student) => (
                                                    <TableRow key={student._id}>
                                                        <TableCell className="hidden sm:table-cell font-mono text-xs">{student.rollNumber || '-'}</TableCell>
                                                        <TableCell className="font-bold">
                                                            <div className="flex flex-col">
                                                                <span>{student.user?.name || 'Unknown'}</span>
                                                                <span className="text-[10px] text-muted-foreground sm:hidden uppercase tracking-tight">
                                                                    Roll: {student.rollNumber} • {student.className}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell text-xs font-mono">{student.user?.studentId || '-'}</TableCell>
                                                        <TableCell className="hidden md:table-cell"><span className="font-mono bg-muted px-2 py-1 rounded text-[10px]">{student.className}</span></TableCell>
                                                        <TableCell className="hidden sm:table-cell">
                                                            <div className="text-xs font-medium">{student.parentName || '-'}</div>
                                                            <div className="text-[10px] text-muted-foreground">{student.parentPhone}</div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { setViewingStudent(student); fetchStudentMarks(student._id); }}>View</Button>
                                                                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { setFormData(student); setShowEditStudent(true); }}>Edit</Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="attendance">
                        <Card className="border-none shadow-none bg-transparent">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Attendance Record</h2>
                                    <p className="text-slate-500 text-sm font-medium">Daily attendance management for your assigned classes.</p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <CustomDatePicker
                                        selectedDate={attendanceDate}
                                        onChange={setAttendanceDate}
                                        label={null}
                                    />
                                    <Button
                                        variant="glass"
                                        className="rounded-xl border-indigo-100 text-indigo-700 gap-2 font-bold px-5"
                                        onClick={() => setShowReport(true)}
                                    >
                                        <BarChart3 className="w-4 h-4 text-indigo-500" /> Detailed Reports
                                    </Button>
                                    <Button
                                        variant="premium"
                                        className="rounded-xl shadow-indigo-200/50 gap-2 px-8"
                                        onClick={handleBulkAttendanceSave}
                                    >
                                        <Save className="w-4 h-4" /> Finalize Attendance
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{students.length} Students Total</span>
                                    <div className="flex gap-2">
                                        <button onClick={markAllPresent} className="text-xs font-bold text-indigo-600 hover:underline">Mark All Present</button>
                                        <span className="text-slate-300">|</span>
                                        <button onClick={resetAttendance} className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1">
                                            <RotateCcw className="w-3 h-3" /> Reset
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow>
                                                <TableHead className="w-16 text-center">No.</TableHead>
                                                <TableHead>Student Name</TableHead>
                                                <TableHead>Class</TableHead>
                                                <TableHead className="text-right pr-8">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {students.map((student, idx) => (
                                                <TableRow key={student._id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                                    <TableCell className="text-center font-mono text-slate-400 text-xs">{idx + 1}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                                                                {student.user?.name?.charAt(0)}
                                                            </div>
                                                            <div className="font-bold text-slate-900">{student.user?.name}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                                                            {student.className}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <div className="inline-flex p-1 bg-slate-100 rounded-2xl gap-1">
                                                            <button
                                                                onClick={() => setAttendanceStatus(prev => ({ ...prev, [student._id]: 'Present' }))}
                                                                className={cn(
                                                                    "px-5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                                                                    attendanceStatus[student._id] === 'Present'
                                                                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-100"
                                                                        : "text-slate-400 hover:text-slate-600 hover:bg-white"
                                                                )}
                                                            >
                                                                {attendanceStatus[student._id] === 'Present' && <Check className="w-3 h-3" />}
                                                                Present
                                                            </button>
                                                            <button
                                                                onClick={() => setAttendanceStatus(prev => ({ ...prev, [student._id]: 'Absent' }))}
                                                                className={cn(
                                                                    "px-5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                                                                    attendanceStatus[student._id] === 'Absent'
                                                                        ? "bg-red-500 text-white shadow-md shadow-red-100"
                                                                        : "text-slate-400 hover:text-slate-600 hover:bg-white"
                                                                )}
                                                            >
                                                                {attendanceStatus[student._id] === 'Absent' && <X className="w-3 h-3" />}
                                                                Absent
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="marks">
                        <Card className="max-w-2xl mx-auto">
                            <CardHeader>
                                <CardTitle>Upload Marks</CardTitle>
                                <CardDescription>Enter exam details and add subjects.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleMarksSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <CustomSelect
                                            label="Student"
                                            options={students.map(s => ({
                                                label: `${s.user?.name} (${s.rollNumber})`,
                                                value: s._id
                                            }))}
                                            value={selectedStudent}
                                            onChange={setSelectedStudent}
                                            placeholder="Select Student"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Exam Name</Label>
                                        <Input
                                            value={examType}
                                            onChange={(e) => setExamType(e.target.value)}
                                            placeholder="e.g. Unit Test 1"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-4 border rounded-md p-4 bg-muted/10">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold text-sm">Subjects</h3>
                                            <Button type="button" variant="outline" size="sm" onClick={handleAddSubjectField}>
                                                <Plus className="w-4 h-4 mr-2" /> Add Subject
                                            </Button>
                                        </div>

                                        {subjectsList.map((sub, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-2 items-end">
                                                <div className="col-span-3 space-y-1">
                                                    <Label>Subject</Label>
                                                    <Input
                                                        value={sub.subjectName}
                                                        onChange={(e) => handleSubjectChange(index, 'subjectName', e.target.value)}
                                                        placeholder="e.g. Maths"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-3 space-y-1">
                                                    <Label>Marks</Label>
                                                    <Input
                                                        type="number"
                                                        value={sub.marksObtained}
                                                        onChange={(e) => handleSubjectChange(index, 'marksObtained', e.target.value)}
                                                        placeholder="Obtained"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-2 space-y-1">
                                                    <Label>Max</Label>
                                                    <Input
                                                        type="number"
                                                        value={sub.maxMarks}
                                                        onChange={(e) => handleSubjectChange(index, 'maxMarks', e.target.value)}
                                                        placeholder="Max"
                                                        required
                                                    />
                                                </div>
                                                 <div className="col-span-3 space-y-1">
                                                     <Label>Pass</Label>
                                                     <Input
                                                         type="number"
                                                         value={sub.passMarks}
                                                         onChange={(e) => handleSubjectChange(index, 'passMarks', e.target.value)}
                                                         placeholder="Pass"
                                                         required
                                                     />
                                                 </div>
                                                 <div className="col-span-1 pb-1">
                                                    {subjectsList.length > 1 && (
                                                        <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveSubjectField(index)}>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-muted/20 p-3 rounded text-sm flex justify-between font-bold">
                                        <span>Total:</span>
                                        <span>
                                            {subjectsList.reduce((acc, curr) => acc + (parseFloat(curr.marksObtained) || 0), 0)} / {subjectsList.reduce((acc, curr) => acc + (parseFloat(curr.maxMarks) || 0), 0)}
                                        </span>
                                    </div>

                                    <Button type="submit" className="w-full">Submit Marks</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="timetable">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Class Timetable</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleTimetableSubmit} className="space-y-6">
                                    <div className="max-w-md space-y-2">
                                        <CustomSelect
                                            label="Class Name"
                                            options={[...new Set(students.map(s => s.className))].sort()}
                                            value={timetableClass}
                                            onChange={setTimetableClass}
                                            placeholder="Select Class"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Input Type</Label>
                                        <div className="flex space-x-6">
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input type="radio" value="image" checked={timetableType === 'image'} onChange={() => setTimetableType('image')} className="text-primary focus:ring-primary" />
                                                <span>Upload Image</span>
                                            </label>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input type="radio" value="manual" checked={timetableType === 'manual'} onChange={() => setTimetableType('manual')} className="text-primary focus:ring-primary" />
                                                <span>Manual Entry</span>
                                            </label>
                                        </div>
                                    </div>

                                    {timetableType === 'image' ? (
                                        <div className="max-w-md space-y-2">
                                            <Label>Upload Image</Label>
                                            <Input type="file" accept="image/*" onChange={(e) => setTimetableFile(e.target.files[0])} />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50">
                                                <div className="space-y-2">
                                                    <Label>Number of Periods</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="12"
                                                        value={numPeriods}
                                                        onChange={(e) => handleConfigChange(selectedDays, parseInt(e.target.value) || 5)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Working Days</Label>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                                            <label key={day} className="flex items-center space-x-1 border px-2 py-1 rounded-md bg-white cursor-pointer hover:bg-gray-100">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedDays.includes(day)}
                                                                    onChange={(e) => {
                                                                        const newDays = e.target.checked
                                                                            ? [...selectedDays, day].sort((a, b) =>
                                                                                ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(a) -
                                                                                ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(b)
                                                                            )
                                                                            : selectedDays.filter(d => d !== day);
                                                                        handleConfigChange(newDays, numPeriods);
                                                                    }}
                                                                    className="rounded text-primary focus:ring-primary"
                                                                />
                                                                <span className="text-sm">{day.slice(0, 3)}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto border rounded-lg">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-muted">
                                                            <th className="p-2 border font-medium">Day</th>
                                                            {Array.from({ length: numPeriods }).map((_, i) => (
                                                                <th key={i} className="p-2 border font-medium">Period {i + 1}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedDays.map(day => (
                                                            <tr key={day}>
                                                                <td className="p-2 border font-medium bg-muted/20">{day}</td>
                                                                {manualSchedule[day]?.map((subject, idx) => (
                                                                    <td key={idx} className="p-1 border h-10 w-32">
                                                                        <input
                                                                            type="text"
                                                                            value={subject}
                                                                            onChange={(e) => handleManualScheduleChange(day, idx, e.target.value)}
                                                                            className="w-full h-full bg-transparent px-2 focus:outline-none focus:bg-accent/20"
                                                                            placeholder="-"
                                                                        />
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    <Button type="submit">Save Timetable</Button>
                                </form>

                                <div className="mt-8 border-t pt-6">
                                    <h3 className="text-lg font-bold mb-4">Current Timetable for Class {timetableClass || '...'}</h3>
                                    {!currentTimetable ? (
                                        <p className="text-gray-500">No timetable found for this class.</p>
                                    ) : (
                                        <div>
                                            {currentTimetable.type === 'image' ? (
                                                <div className="border rounded p-2 inline-block bg-gray-50">
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL}${currentTimetable.imageUrl}`}
                                                        alt="Timetable"
                                                        className="max-w-full h-auto max-h-96 rounded"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto border rounded-lg">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="bg-muted">
                                                                <th className="p-2 border font-medium">Day</th>
                                                                {/* Infer periods from the first day's schedule */}
                                                                {currentTimetable.schedule && Object.keys(currentTimetable.schedule).length > 0 &&
                                                                    currentTimetable.schedule[Object.keys(currentTimetable.schedule)[0]].map((_, i) => (
                                                                        <th key={i} className="p-2 border font-medium">Period {i + 1}</th>
                                                                    ))
                                                                }
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {Object.keys(currentTimetable.schedule || {}).map(day => (
                                                                <tr key={day}>
                                                                    <td className="p-2 border font-medium bg-muted/20">{day}</td>
                                                                    {currentTimetable.schedule[day]?.map((sub, idx) => (
                                                                        <td key={idx} className="p-2 border">{sub}</td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-2">Last Updated: {new Date(currentTimetable.lastUpdated).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="events">
                        <div className="max-w-2xl space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Manage Events</CardTitle></CardHeader>
                                <CardContent>
                                    <AddEventForm onEventAdded={() => { }} />
                                </CardContent>
                            </Card>
                            <EventSection />
                        </div>
                    </TabsContent>
                </div>
            </Tabs >

            {/* Modals - Wrapped in Portal to avoid clipping */}
            <Portal>
                < AnimatePresence >
                    {showAddStudent && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[100]">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md max-h-[85vh] overflow-y-auto relative">
                                <button onClick={() => setShowAddStudent(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                                <h2 className="text-xl font-bold mb-4">Add New Student</h2>
                                {msg && <div className={`p-2 mb-4 rounded text-sm ${msg.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg}</div>}
                                <form onSubmit={handleAddStudent} className="space-y-3">
                                    <div className="pt-2"><h3 className="font-semibold text-sm">Student Details</h3></div>
                                    <div className="space-y-1"><Label>Name</Label><Input name="name" onChange={handleValidChange} required /></div>
                                    <div className="space-y-1"><Label>Email</Label><Input name="email" type="email" onChange={handleValidChange} /></div>
                                    <div className="space-y-1"><Label>Student ID</Label><Input name="studentId" onChange={handleValidChange} /></div>

                                    <ClassSelector
                                        value={formData.className}
                                        onChange={(val) => setFormData({ ...formData, className: val })}
                                        required
                                    />

                                    <div className="space-y-1"><Label>Roll Number</Label><Input name="rollNumber" onChange={handleValidChange} /></div>
                                    <div className="pt-2"><h3 className="font-semibold text-sm">Parent Details</h3></div>
                                    <div className="space-y-1"><Label>Parent Name</Label><Input name="parentName" onChange={handleValidChange} /></div>
                                    <div className="space-y-1"><Label>Parent Email</Label><Input name="parentEmail" type="email" onChange={handleValidChange} /></div>
                                    <div className="space-y-1"><Label>Parent Phone</Label><Input name="parentPhone" onChange={handleValidChange} /></div>
                                    <div className="flex justify-end space-x-2 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setShowAddStudent(false)}>Cancel</Button>
                                        <Button type="submit">Add</Button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </ AnimatePresence >

                <AnimatePresence>
                    {showBulkUpload && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[100]">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
                                <h2 className="text-xl font-bold mb-2">Bulk Upload Students</h2>
                                <p className="text-sm text-muted-foreground mb-4">Upload an Excel (.xlsx) file with headers: Name, Email, Class, Roll No, Parent Name, Parent Email, Parent Phone.</p>
                                <form onSubmit={handleBulkUpload} className="space-y-4">
                                    <Input type="file" accept=".xlsx, .xls" onChange={(e) => setBulkFile(e.target.files[0])} required />
                                    <div className="flex justify-end space-x-2">
                                        <Button type="button" variant="outline" onClick={() => setShowBulkUpload(false)}>Cancel</Button>
                                        <Button type="submit">Upload</Button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Student Details / Edit Modal */}
                <AnimatePresence>
                    {viewingStudent && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[100]">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4">Student Details</h2>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-semibold">Name:</span> {viewingStudent.user?.name}</p>
                                    <p><span className="font-semibold">Class:</span> {viewingStudent.className}</p>
                                    <p><span className="font-semibold">Roll No:</span> {viewingStudent.rollNumber}</p>
                                    <div className="my-2 border-t" />
                                    <p><span className="font-semibold">Parent Name:</span> {viewingStudent.parentName}</p>
                                    <p><span className="font-semibold">Parent Parent Email:</span> {viewingStudent.parentEmail}</p>
                                    <p><span className="font-semibold">Parent Phone:</span> {viewingStudent.parentPhone}</p>

                                    <div className="my-3 border-t pt-2" />
                                    <h3 className="font-bold mb-2">Academic Record</h3>
                                    {studentMarks.length === 0 ? <p className="text-sm text-muted-foreground">No marks found.</p> : (
                                        <div className="max-h-60 overflow-y-auto border rounded">
                                            {studentMarks.map((exam, idx) => (
                                                <div key={exam._id} className={`p-2 ${idx !== studentMarks.length - 1 ? 'border-b' : ''}`}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h4 className="font-semibold text-sm text-primary">{exam.examType}</h4>
                                                        <span className="text-xs font-bold bg-muted px-2 py-1 rounded">
                                                            Total: {exam.grandTotalObtained} / {exam.grandTotalMax}
                                                        </span>
                                                    </div>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow className="bg-muted/30 border-none h-6">
                                                                <TableHead className="py-1 h-6 text-xs">Subject</TableHead>
                                                                <TableHead className="py-1 h-6 text-xs text-right">Score</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {exam.subjects.map((sub, sIdx) => (
                                                                <TableRow key={sIdx} className="border-none h-6 hover:bg-transparent">
                                                                    <TableCell className="py-1 text-xs">{sub.subjectName}</TableCell>
                                                                    <TableCell className="py-1 text-xs text-right font-medium">
                                                                        {sub.marksObtained} / {sub.maxMarks}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                    <div className="text-[10px] text-muted-foreground mt-1 text-right">
                                                        {new Date(exam.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end mt-6 space-x-2">
                                    <Button
                                        onClick={() => {
                                            setFormData(viewingStudent);
                                            setShowEditStudent(true);
                                            setViewingStudent(null);
                                        }}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                    >
                                        Edit
                                    </Button>
                                    <Button variant="outline" onClick={() => setViewingStudent(null)}>Close</Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showEditStudent && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md max-h-[85vh] overflow-y-auto relative">
                                <button onClick={() => setShowEditStudent(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                                <h2 className="text-xl font-bold mb-4">Edit Student</h2>
                                <form onSubmit={handleEditStudent} className="space-y-3">
                                    <div className="text-sm text-muted-foreground mb-2">Editing: {formData.user?.name}</div>

                                    <ClassSelector
                                        value={formData.className}
                                        onChange={(val) => setFormData({ ...formData, className: val })}
                                        required
                                    />

                                    <div className="space-y-1"><Label>Roll Number</Label><Input name="rollNumber" value={formData.rollNumber || ''} onChange={handleValidChange} /></div>
                                    <div className="pt-2"><h3 className="font-semibold text-sm">Parent Mapping</h3></div>
                                    <div className="space-y-1"><Label>Parent Name</Label><Input name="parentName" value={formData.parentName || ''} onChange={handleValidChange} /></div>
                                    <div className="space-y-1"><Label>Parent Email</Label><Input name="parentEmail" type="email" value={formData.parentEmail || ''} onChange={handleValidChange} /></div>
                                    <div className="space-y-1"><Label>Parent Phone</Label><Input name="parentPhone" value={formData.parentPhone || ''} onChange={handleValidChange} /></div>
                                    <div className="flex justify-end space-x-2 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setShowEditStudent(false)}>Cancel</Button>
                                        <Button type="submit">Update</Button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </Portal>

            <AttendanceReportModal
                isOpen={showReport}
                onClose={() => setShowReport(false)}
                className={students[0]?.className} // Assuming teacher handles one class for simplicity, or we could add a selector in the modal
            />
        </motion.div >
    );
};

export default TeacherDashboard;
