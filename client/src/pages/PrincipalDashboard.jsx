import { useState, useEffect } from 'react';
import Portal from '../components/UI/Portal';
import axios from 'axios';
import { Users, UserCheck, GraduationCap, School, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import useEventBadge from '../hooks/useEventBadge';
import EventSection from '../components/Dashboard/EventSection';
import AddEventForm from '../components/Dashboard/AddEventForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/UI/Tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/UI/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/UI/Table';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Label } from '../components/UI/Label';
import ClassSelector from '../components/UI/ClassSelector';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { X } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const PrincipalDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { hasUnread, markRead } = useEventBadge();
    const [stats, setStats] = useState({ students: 0, teachers: 0, users: 0 });
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const { user } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();

    // Sync URL path with activeTab
    useEffect(() => {
        if (location.pathname.includes('/students')) setActiveTab('students');
        else if (location.pathname.includes('/teachers')) setActiveTab('teachers');
        else if (location.pathname.includes('/events')) {
            setActiveTab('events');
            markRead();
        }
        else setActiveTab('overview');
    }, [location]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'events') markRead();
        if (tab === 'overview') navigate('/principal/dashboard');
        else navigate(`/principal/${tab}`);
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAddTeacher, setShowAddTeacher] = useState(false);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showEditStudent, setShowEditStudent] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({});

    // Class Selector State for Teachers
    const [tempClass, setTempClass] = useState('');
    const [assignedClassesList, setAssignedClassesList] = useState([]);

    const [msg, setMsg] = useState('');
    const token = user?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => { fetchStats(); if (activeTab === 'teachers') fetchTeachers(); if (activeTab === 'students') fetchStudents(); }, [activeTab]);

    const fetchStats = async () => { try { const { data } = await axios.get('/api/dashboard/stats', config); setStats(data); } catch (error) { console.error(error); } };
    const fetchTeachers = async () => { setLoading(true); try { const { data } = await axios.get('/api/teachers', config); setTeachers(data); } catch (error) { console.error(error); } setLoading(false); };
    const fetchStudents = async () => { setLoading(true); setError(''); try { const { data } = await axios.get('/api/students', config); setStudents(data); } catch (error) { console.error(error); setError('Failed to fetch students. Verify your permissions or server status.'); } setLoading(false); };
    const handleValidChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        if (assignedClassesList.length === 0) {
            setMsg('Error: Please assign at least one class (click "Add" after selecting).');
            return;
        }
        try {
            await axios.post('/api/teachers', { ...formData, assignedClasses: assignedClassesList, password: 'password123' }, config);
            setMsg('Teacher added successfully!');
            setAssignedClassesList([]); // Reset list
            setTimeout(() => { setMsg(''); setShowAddTeacher(false); fetchTeachers(); }, 2000);
        } catch (error) { setMsg(error.response?.data?.message || 'Error adding teacher'); }
    };
    const handleAddStudent = async (e) => { e.preventDefault(); try { await axios.post('/api/students', { ...formData, password: 'password123' }, config); setMsg('Student added successfully!'); setTimeout(() => { setMsg(''); setShowAddStudent(false); fetchStudents(); }, 2000); } catch (error) { setMsg(error.response?.data?.message || 'Error adding student'); } };
    const handleEditStudent = async (e) => { e.preventDefault(); try { await axios.put(`/api/students/${formData._id}`, formData, config); setMsg('Student updated successfully!'); setTimeout(() => { setMsg(''); setShowEditStudent(false); fetchStudents(); }, 2000); } catch (error) { setMsg(error.response?.data?.message || 'Error updating student'); } };

    if (loading && activeTab === 'overview') return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;

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
                className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 md:p-8 text-white shadow-xl mb-4 md:mb-8"
            >
                <div className="relative z-10">
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight mb-2 text-center md:text-left">Welcome Back, Principal</h1>
                    <p className="text-purple-100 text-sm md:text-base max-w-xl text-center md:text-left">
                        Here's what's happening in your school today. You have <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">{hasUnread ? 'new' : 'no new'}</span> notifications.
                    </p>
                </div>
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl hidden md:block"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-white/10 blur-2xl hidden md:block"></div>
            </motion.div>

            <div className="flex justify-between items-center hidden">
                {/* Hiding old header since we have the banner now */}
                <h1 className="text-3xl font-bold tracking-tight">Principal Dashboard</h1>
            </div>

            {msg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-3 rounded-md text-sm font-medium ${msg.includes('Error') ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700'}`}>
                    {msg}
                </motion.div>
            )}

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto pb-4 -mb-4 no-scrollbar">
                    <TabsList className="flex w-fit md:grid md:w-full md:grid-cols-4 min-w-max md:min-w-0 bg-white/50 backdrop-blur-md shadow-lg p-1.5 border-white/50 rounded-2xl">
                        <TabsTrigger value="overview" className="rounded-xl px-8 md:px-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">Overview</TabsTrigger>
                        <TabsTrigger value="teachers" className="rounded-xl px-8 md:px-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">Teachers</TabsTrigger>
                        <TabsTrigger value="students" className="rounded-xl px-8 md:px-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">Students</TabsTrigger>
                        <TabsTrigger value="events" className="relative rounded-xl px-8 md:px-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
                            Events
                            {hasUnread && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
                            {hasUnread && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="mt-6">
                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                            <StatCard title="Total Students" value={stats.students} icon={<GraduationCap className="h-6 w-6 md:h-8 md:w-8" />} color="text-blue-600" />
                            <StatCard title="Total Teachers" value={stats.teachers} icon={<UserCheck className="h-6 w-6 md:h-8 md:w-8" />} color="text-emerald-600" />
                            <StatCard title="Total Users" value={stats.users} icon={<Users className="h-6 w-6 md:h-8 md:w-8" />} color="text-purple-600" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card glass className="border-0">
                                <CardHeader><CardTitle className="text-xl font-bold text-slate-800">User Distribution</CardTitle></CardHeader>
                                <CardContent className="h-[300px] flex justify-center">
                                    <Pie data={{
                                        labels: ['Students', 'Teachers', 'Others'],
                                        datasets: [{
                                            data: [stats.students, stats.teachers, stats.users - stats.students - stats.teachers],
                                            backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6'],
                                            borderWidth: 0,
                                            hoverOffset: 10
                                        }]
                                    }} options={{
                                        maintainAspectRatio: false,
                                        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } },
                                        cutout: '70%'
                                    }} />
                                </CardContent>
                            </Card>
                            <Card glass className="border-0">
                                <CardHeader><CardTitle className="text-xl font-bold text-slate-800">Attendance Trends</CardTitle></CardHeader>
                                <CardContent className="h-[300px]">
                                    <Line data={{
                                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                                        datasets: [{
                                            label: 'Attendance Rate (%)',
                                            data: [95, 92, 98, 94, 96, 90],
                                            borderColor: '#3b82f6',
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            fill: true,
                                            tension: 0.4,
                                            pointRadius: 4,
                                            pointBackgroundColor: '#fff',
                                            pointBorderWidth: 2,
                                        }]
                                    }} options={{
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.03)' }, border: { display: false } },
                                            x: { grid: { display: false }, border: { display: false } }
                                        }
                                    }} />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>



                    <TabsContent value="teachers">
                        <Card glass className="border-0 shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div><CardTitle className="text-2xl font-bold">Teachers Directory</CardTitle><CardDescription>Manage and monitor your teaching staff.</CardDescription></div>
                                <Button onClick={() => setShowAddTeacher(true)} variant="premium">
                                    <Plus className="w-4 h-4 mr-2" /> Add Teacher
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {teachers.length === 0 ? <p className="text-center py-4 text-muted-foreground">No teachers found.</p> : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow><TableHead>Name</TableHead><TableHead className="hidden sm:table-cell">Subject</TableHead><TableHead className="hidden lg:table-cell">Qualification</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {teachers.map(t => (
                                                    <TableRow key={t._id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedUser({ type: 'teacher', data: t })}>
                                                        <TableCell className="font-medium">
                                                            <div className="flex flex-col">
                                                                <span>{t.user?.name || 'Unknown'}</span>
                                                                <span className="text-xs text-muted-foreground sm:hidden">{t.subject}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden sm:table-cell">{t.subject}</TableCell>
                                                        <TableCell className="hidden lg:table-cell">{t.qualification || 'N/A'}</TableCell>
                                                        <TableCell className="text-right"><span className="text-primary text-sm font-medium">View</span></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="students">
                        <Card glass className="border-0 shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div><CardTitle className="text-2xl font-bold">Students Directory</CardTitle><CardDescription>Enrolled student records and management.</CardDescription></div>
                                <Button onClick={() => setShowAddStudent(true)} variant="premium">
                                    <Plus className="w-4 h-4 mr-2" /> Add Student
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {error && <p className="text-destructive mb-4">{error}</p>}
                                {students.length === 0 ? <p className="text-center py-4 text-muted-foreground">No students found.</p> : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow><TableHead>Name</TableHead><TableHead className="hidden sm:table-cell">Class</TableHead><TableHead className="hidden lg:table-cell">Roll No</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {students.map(s => (
                                                    <TableRow key={s._id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedUser({ type: 'student', data: s })}>
                                                        <TableCell className="font-medium">
                                                            <div className="flex flex-col">
                                                                <span>{s.user?.name || 'Unknown'}</span>
                                                                <span className="text-xs text-muted-foreground sm:hidden">{s.className}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden sm:table-cell">{s.className}</TableCell>
                                                        <TableCell className="hidden lg:table-cell">{s.rollNumber || 'N/A'}</TableCell>
                                                        <TableCell className="text-right"><span className="text-primary text-sm font-medium">View</span></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
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
            </Tabs>

            {/* Modals moved to Portal to avoid clipping by sidebar/navbar stacking context */}
            <Portal>
                <AnimatePresence>
                    {showAddTeacher && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[100]">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md relative">
                                <button type="button" onClick={() => setShowAddTeacher(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                                <h2 className="text-xl font-bold mb-4">Add Teacher</h2>
                                <form onSubmit={handleAddTeacher} className="space-y-3">
                                    <div className="space-y-1"><Label>Name</Label><Input name="name" onChange={handleValidChange} required /></div>
                                    <div className="space-y-1"><Label>Email</Label><Input name="email" type="email" onChange={handleValidChange} required /></div>
                                    <div className="space-y-1"><Label>Phone Number</Label><Input name="phone" onChange={handleValidChange} required /></div>
                                    <div className="space-y-1"><Label>Subject</Label><Input name="subject" onChange={handleValidChange} required /></div>
                                    <div className="space-y-1"><Label>Qualification</Label><Input name="qualification" onChange={handleValidChange} /></div>

                                    <div className="space-y-1">
                                        <Label>Assigned Classes</Label>
                                        <div className="flex flex-wrap gap-2 mb-2 p-2 border rounded-md min-h-[42px] bg-muted/20">
                                            {assignedClassesList.length === 0 && <span className="text-xs text-muted-foreground self-center">No classes assigned yet.</span>}
                                            {assignedClassesList.map(cls => (
                                                <span key={cls} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs flex items-center border border-primary/20">
                                                    {cls}
                                                    <button type="button" onClick={() => setAssignedClassesList(prev => prev.filter(c => c !== cls))} className="ml-2 hover:text-destructive font-bold">×</button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <div className="flex-1">
                                                <ClassSelector value={tempClass} onChange={setTempClass} label="Add Class" />
                                            </div>
                                            <Button type="button" size="sm" onClick={() => {
                                                if (tempClass && !assignedClassesList.includes(tempClass)) {
                                                    setAssignedClassesList([...assignedClassesList, tempClass]);
                                                    setTempClass('');
                                                }
                                            }} className="mb-0.5">Add</Button>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-2 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setShowAddTeacher(false)}>Cancel</Button>
                                        <Button type="submit">Add</Button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showAddStudent && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[100]">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative">
                                <button type="button" onClick={() => setShowAddStudent(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                                <h2 className="text-xl font-bold mb-4">Add Student</h2>
                                <form onSubmit={handleAddStudent} className="space-y-3">
                                    <div className="space-y-1"><Label>Name</Label><Input name="name" onChange={handleValidChange} required /></div>
                                    <div className="space-y-1"><Label>Email</Label><Input name="email" type="email" onChange={handleValidChange} /></div>
                                    <div className="space-y-1"><Label>Student ID</Label><Input name="studentId" onChange={handleValidChange} /></div>
                                    <ClassSelector value={formData.className || ''} onChange={(val) => setFormData({ ...formData, className: val })} label="Class" required />
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
                </AnimatePresence>

                <AnimatePresence>
                    {selectedUser && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[100]">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md relative">
                                <button type="button" onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                                <h2 className="text-xl font-bold mb-4">Details</h2>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-semibold">Name:</span> {selectedUser.data.user?.name}</p>
                                    <p><span className="font-semibold">Email:</span> {selectedUser.data.user?.email}</p>
                                    <p><span className="font-semibold">Phone:</span> {selectedUser.data.user?.phone || 'N/A'}</p>
                                    {selectedUser.type === 'teacher' && (
                                        <>
                                            <p><span className="font-semibold">Subject:</span> {selectedUser.data.subject}</p>
                                            <p><span className="font-semibold">Qualification:</span> {selectedUser.data.qualification}</p>
                                        </>
                                    )}
                                    {selectedUser.type === 'student' && (
                                        <>
                                            <p><span className="font-semibold">Class:</span> {selectedUser.data.className}</p>
                                            <p><span className="font-semibold">Roll No:</span> {selectedUser.data.rollNumber}</p>
                                            <div className="my-2 border-t" />
                                            <p><span className="font-semibold">Parent Name:</span> {selectedUser.data.parentName}</p>
                                            <p><span className="font-semibold">Parent Email:</span> {selectedUser.data.parentEmail}</p>
                                            <p><span className="font-semibold">Parent Phone:</span> {selectedUser.data.parentPhone}</p>
                                        </>
                                    )}
                                </div>
                                <div className="flex justify-end mt-6 space-x-2">
                                    {selectedUser.type === 'student' && (
                                        <Button
                                            onClick={() => {
                                                setFormData(selectedUser.data);
                                                setShowEditStudent(true);
                                                setSelectedUser(null);
                                            }}
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                        >
                                            Edit
                                        </Button>
                                    )}
                                    <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showEditStudent && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[100]">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative">
                                <button type="button" onClick={() => setShowEditStudent(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                                <h2 className="text-xl font-bold mb-4">Edit Student</h2>
                                <form onSubmit={handleEditStudent} className="space-y-3">
                                    <div className="text-sm text-muted-foreground mb-2">Editing: {formData.user?.name}</div>
                                    <ClassSelector value={formData.className || ''} onChange={(val) => setFormData({ ...formData, className: val })} label="Class" required />
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
        </motion.div>
    );
};

const CountUp = ({ to }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        const controls = animate(0, to, {
            duration: 2,
            onUpdate: value => setCount(Math.floor(value)),
            ease: "easeOut"
        });
        return controls.stop;
    }, [to]);
    return <>{count}</>;
};


const StatCard = ({ title, value, icon, color }) => (
    <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
        <Card glass className="border-0 relative group overflow-hidden">
            <div className={`absolute top-0 left-0 w-1.5 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity duration-500`} />
            <CardContent className="flex items-center justify-between p-6 relative z-10">
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter">
                        <CountUp to={value} />
                    </div>
                </div>
                <div className={`p-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 group-hover:scale-110 transition-transform duration-500 ${color || 'text-primary'}`}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

export default PrincipalDashboard;
