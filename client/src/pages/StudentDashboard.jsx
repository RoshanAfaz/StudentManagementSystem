import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import EventSection from '../components/Dashboard/EventSection';
import useEventBadge from '../hooks/useEventBadge';
import useStudentData from '../hooks/useStudentData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/UI/Tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/UI/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/UI/Table';
import { Badge } from 'lucide-react'; // Placeholder badge
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { hasUnread, markRead } = useEventBadge();
    const location = useLocation();
    const navigate = useNavigate();

    // Sync URL path with activeTab
    useEffect(() => {
        if (location.pathname.includes('/marks')) setActiveTab('marks');
        else if (location.pathname.includes('/attendance')) setActiveTab('attendance');
        else if (location.pathname.includes('/timetable')) setActiveTab('timetable');
        else if (location.pathname.includes('/events')) {
            setActiveTab('events');
            markRead();
        }
        else setActiveTab('overview');
    }, [location]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'events') markRead();
        if (tab === 'overview') navigate('/student/dashboard');
        else navigate(`/student/${tab}`);
    };

    const { profile: studentProfile, marks, attendance, timetable } = useStudentData(false);
    const { user } = useAuth();

    if (!studentProfile) {
        return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
            </div>

            <Card className="bg-gradient-to-r from-primary/10 to-blue-50 border-none shadow-sm">
                <CardContent className="flex items-center space-x-4 p-6">
                    <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl font-bold text-primary">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                        <p className="text-gray-600">Class: <span className="font-semibold">{studentProfile.className}</span> | Roll No: <span className="font-semibold">{studentProfile.rollNumber}</span></p>
                    </div>
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto pb-4 -mb-4 no-scrollbar">
                    <TabsList className="flex w-fit lg:grid lg:w-full lg:grid-cols-5 min-w-max lg:min-w-0 bg-white shadow-sm p-1 border rounded-xl">
                        <TabsTrigger value="overview" className="rounded-lg px-6 lg:px-2">Overview</TabsTrigger>
                        <TabsTrigger value="marks" className="rounded-lg px-6 lg:px-2">My Marks</TabsTrigger>
                        <TabsTrigger value="attendance" className="rounded-lg px-6 lg:px-2">Attendance</TabsTrigger>
                        <TabsTrigger value="timetable" className="rounded-lg px-6 lg:px-2">Timetable</TabsTrigger>
                        <TabsTrigger value="events" className="relative rounded-lg px-6 lg:px-2">
                            Events
                            {hasUnread && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6"
                >
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Recent Exam Score</CardTitle>
                                    <div className="text-2xl font-bold">{marks.length > 0 ? `${marks[0].grandTotalObtained}/${marks[0].grandTotalMax}` : '-'}</div>
                                    <CardDescription>Latest: {marks.length > 0 ? marks[0].examType : 'N/A'}</CardDescription>
                                </CardHeader>
                            </Card>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Attendance</CardTitle>
                                    <div className="text-2xl font-bold">
                                        {attendance.length > 0 ? `${Math.round((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100)}%` : '0%'}
                                    </div>
                                    <CardDescription>Overall Attendance</CardDescription>
                                </CardHeader>
                            </Card>
                            {/* Add more widgets here */}
                        </div>
                    </TabsContent>

                    <TabsContent value="marks">
                        <Card>
                            <CardHeader>
                                <CardTitle>Academic Performance</CardTitle>
                                <CardDescription>Your marks for all subjects and exams.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {marks.length === 0 ? <p className="text-muted-foreground py-4 text-center">No marks uploaded yet.</p> : (
                                    <div className="space-y-6">
                                        {marks.map((exam) => (
                                            <div key={exam._id} className="border rounded-lg p-4 bg-card">
                                                <div className="flex justify-between items-center mb-3 pb-2 border-b">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-primary">{exam.examType}</h3>
                                                        <p className="text-xs text-muted-foreground">{new Date(exam.date).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-semibold text-muted-foreground">Total Score</div>
                                                        <div className="text-xl font-bold">{exam.grandTotalObtained} / {exam.grandTotalMax}</div>
                                                    </div>
                                                </div>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-muted/50">
                                                            <TableHead>Subject</TableHead>
                                                            <TableHead className="text-right">Score</TableHead>
                                                            <TableHead className="text-right hidden sm:table-cell">Pass Mark</TableHead>
                                                            <TableHead className="text-right hidden sm:table-cell">Max Marks</TableHead>
                                                            <TableHead className="text-right">Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {exam.subjects.map((sub, idx) => (
                                                            <TableRow key={idx}>
                                                                <TableCell className="font-medium text-sm">{sub.subjectName}</TableCell>
                                                                <TableCell className="text-right font-bold text-sm">{sub.marksObtained}</TableCell>
                                                                <TableCell className="text-right text-muted-foreground text-xs hidden sm:table-cell">{sub.passMarks || 35}</TableCell>
                                                                <TableCell className="text-right text-xs hidden sm:table-cell">{sub.maxMarks}</TableCell>
                                                                <TableCell className="text-right">
                                                                    <span className={cn(
                                                                        "text-[10px] font-black px-1.5 py-0.5 rounded",
                                                                        sub.marksObtained >= (sub.passMarks || 35) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                                    )}>
                                                                        {sub.marksObtained >= (sub.passMarks || 35) ? 'PASS' : 'FAIL'}
                                                                    </span>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="attendance">
                        <Card>
                            <CardHeader>
                                <CardTitle>Attendance Record</CardTitle>
                                <CardDescription>Detailed view of your daily attendance.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {attendance.length === 0 ? <p className="text-muted-foreground py-4 text-center">No attendance records.</p> : (
                                    <div className="max-h-[500px] overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {attendance.map(a => (
                                                    <TableRow key={a._id}>
                                                        <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                                                        <TableCell className={a.status === 'Present' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                                            {a.status}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="timetable">
                        <Card>
                            <CardHeader>
                                <CardTitle>Weekly Timetable</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!timetable ? <p className="text-muted-foreground py-4 text-center">No timetable available for Class {studentProfile.className}.</p> : (
                                    <div>
                                        {timetable.type === 'image' ? (
                                            <div className="border rounded-lg p-2 bg-gray-50 flex justify-center">
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}${timetable.imageUrl}`}
                                                    alt="Timetable"
                                                    className="max-w-full h-auto rounded shadow-sm"
                                                />
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto border rounded-lg">
                                                <table className="w-full border-collapse text-sm">
                                                    <thead>
                                                        <tr className="bg-muted/50">
                                                            <th className="border p-3 text-left font-medium text-muted-foreground">Day</th>
                                                            {/* Dynamic Headers */}
                                                            {Object.keys(timetable.schedule).length > 0 && timetable.schedule[Object.keys(timetable.schedule)[0]].map((_, i) => (
                                                                <th key={i} className="border p-3 text-left font-medium text-muted-foreground">Period {i + 1}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.keys(timetable.schedule).map(day => (
                                                            <tr key={day} className="border-b last:border-0 hover:bg-muted/30">
                                                                <td className="border-r p-3 font-medium bg-muted/20">{day}</td>
                                                                {timetable.schedule[day].map((sub, idx) => (
                                                                    <td key={idx} className="border-r last:border-0 p-3">{sub}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-4 text-right">Last Updated: {new Date(timetable.lastUpdated).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="events">
                        <div className="space-y-4">
                            <EventSection />
                        </div>
                    </TabsContent>
                </motion.div>
            </Tabs>
        </div>
    );
};

export default StudentDashboard;
