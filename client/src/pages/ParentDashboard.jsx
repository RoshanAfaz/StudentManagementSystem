import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventSection from '../components/Dashboard/EventSection';
import useEventBadge from '../hooks/useEventBadge';
import useStudentData from '../hooks/useStudentData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/UI/Tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/UI/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/UI/Table';
import { Button } from '../components/UI/Button';
import { motion } from 'framer-motion';

const ParentDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { hasUnread, markRead } = useEventBadge();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.pathname.includes('/timetable')) setActiveTab('timetable');
        else if (location.pathname.includes('/events')) {
            setActiveTab('events');
            markRead();
        }
        else setActiveTab('overview');
    }, [location]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'events') markRead();
        if (tab === 'overview') navigate('/parent/dashboard');
        else navigate(`/parent/${tab}`);
    };

    const { profile: studentProfile, marks, attendance, timetable, teachers, error: errorMsg } = useStudentData(true);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>

            {studentProfile ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="flex flex-col justify-center p-6 h-full">
                                <div>
                                    <h2 className="text-xl font-bold text-primary">Child: {studentProfile.user?.name}</h2>
                                    <p className="text-muted-foreground mt-1">Class: <span className="font-medium text-foreground">{studentProfile.className}</span> | Roll No: <span className="font-medium text-foreground">{studentProfile.rollNumber}</span></p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Class Teacher(s)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {teachers.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">
                                        <p>No teachers assigned yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {teachers.map(t => (
                                            <div key={t._id} className="flex items-start justify-between border-b pb-2 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="font-semibold text-sm">{t.user?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{t.subject}</p>
                                                </div>
                                                <div className="text-right text-xs">
                                                    <p className="text-blue-600">{t.user?.email}</p>
                                                    <p className="text-gray-500 mt-1">{t.user?.phone || 'No phone'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 max-w-md bg-white shadow-sm p-1 border">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="timetable">Timetable</TabsTrigger>
                            <TabsTrigger value="events" className="relative">
                                Events
                                {hasUnread && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            <TabsContent value="overview">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader><CardTitle>Academic Performance</CardTitle></CardHeader>
                                        <CardContent>
                                            {marks.length === 0 ? <p className="text-muted-foreground">No marks available.</p> : (
                                                <div className="space-y-4">
                                                    {marks.map(exam => (
                                                        <div key={exam._id} className="border rounded-lg p-3">
                                                            <div className="flex justify-between items-center mb-2 border-b pb-1">
                                                                <h4 className="font-semibold text-primary">{exam.examType}</h4>
                                                                <span className="text-sm font-bold bg-muted px-2 py-0.5 rounded">
                                                                    {exam.grandTotalObtained}/{exam.grandTotalMax}
                                                                </span>
                                                            </div>
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow className="h-8 bg-muted/30">
                                                                        <TableHead className="h-8 py-1">Subject</TableHead>
                                                                        <TableHead className="h-8 py-1 text-right">Score</TableHead>
                                                                        <TableHead className="h-8 py-1 text-right">Pass Mark</TableHead>
                                                                        <TableHead className="h-8 py-1 text-right">Status</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {exam.subjects.map((sub, idx) => (
                                                                        <TableRow key={idx} className="h-8 border-none">
                                                                            <TableCell className="py-1">{sub.subjectName}</TableCell>
                                                                            <TableCell className="py-1 text-right font-medium">{sub.marksObtained} / {sub.maxMarks}</TableCell>
                                                                            <TableCell className="py-1 text-right text-xs text-muted-foreground">{sub.passMarks || 35}</TableCell>
                                                                            <TableCell className="py-1 text-right">
                                                                                <span className={sub.marksObtained >= (sub.passMarks || 35) ? 'text-green-600 font-bold text-xs' : 'text-red-500 font-bold text-xs'}>
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

                                    <Card className="bg-card/50 backdrop-blur-sm">
                                        <CardHeader><CardTitle>Attendance Record</CardTitle></CardHeader>
                                        <CardContent>
                                            {attendance.length === 0 ? <p className="text-muted-foreground">No attendance records.</p> : (
                                                <div className="max-h-64 overflow-y-auto pr-2">
                                                    <Table>
                                                        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                                        <TableBody>
                                                            {attendance.map(a => (
                                                                <TableRow key={a._id}>
                                                                    <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                                                                    <TableCell className={a.status === 'Present' ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>{a.status}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="timetable">
                                <Card>
                                    <CardHeader><CardTitle>Class Timetable</CardTitle></CardHeader>
                                    <CardContent>
                                        {!timetable ? <p className="text-muted-foreground">No timetable available for Class {studentProfile.className}.</p> : (
                                            <div>
                                                {timetable.type === 'image' ? (
                                                    <div className="border rounded-lg overflow-hidden">
                                                        <img
                                                            src={`${import.meta.env.VITE_API_URL}${timetable.imageUrl}`}
                                                            alt="Timetable"
                                                            className="w-full h-auto object-contain"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="overflow-x-auto rounded-md border">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="bg-secondary/50 font-bold">Day</TableHead>
                                                                    {/* Dynamic Headers */}
                                                                    {Object.keys(timetable.schedule).length > 0 && timetable.schedule[Object.keys(timetable.schedule)[0]].map((_, i) => (
                                                                        <TableHead key={i} className="bg-secondary/50 font-bold text-center">Period {i + 1}</TableHead>
                                                                    ))}
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {Object.keys(timetable.schedule).map(day => (
                                                                    <TableRow key={day}>
                                                                        <TableCell className="font-medium bg-secondary/20">{day}</TableCell>
                                                                        {timetable.schedule[day].map((sub, idx) => (
                                                                            <TableCell key={idx} className="text-center">{sub}</TableCell>
                                                                        ))}
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-4 text-right">Last Updated: {new Date(timetable.lastUpdated).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="events">
                                <Card>
                                    <CardHeader><CardTitle>School Events</CardTitle></CardHeader>
                                    <CardContent>
                                        <EventSection />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </>
            ) : (
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-6">
                        <p className="text-yellow-800 font-medium">{errorMsg || "Loading..."}</p>
                        {errorMsg && <p className="text-yellow-700 text-sm mt-2">Please contact the principal to update the parent email/phone in the student record.</p>}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ParentDashboard;
