import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const useStudentData = (shouldFetchTeachers = false) => {
    const { user } = useAuth();
    const [data, setData] = useState({
        profile: null,
        marks: [],
        attendance: [],
        timetable: null,
        teachers: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };

                // 1. Fetch Profile
                // This endpoint works for both Student (gets own profile) and Parent (gets child's profile)
                const profileRes = await axios.get('/api/students/profile', config);
                const profile = profileRes.data;

                if (profile) {
                    // 2. Fetch Related Data in Parallel
                    const promises = [
                        axios.get(`/api/marks/student/${profile._id}`, config),
                        axios.get(`/api/attendance/student/${profile._id}`, config),
                        axios.get(`/api/timetable/${profile.className}`, config).catch(() => ({ data: null }))
                    ];

                    if (shouldFetchTeachers) {
                        promises.push(
                            axios.get(`/api/teachers/class/${profile.className}`, config).catch(() => ({ data: [] }))
                        );
                    }

                    const results = await Promise.all(promises);

                    setData({
                        profile,
                        marks: results[0].data,
                        attendance: results[1].data,
                        timetable: results[2].data,
                        teachers: shouldFetchTeachers ? (results[3].data || []) : []
                    });
                    setError(null);
                }
            } catch (err) {
                console.error("Error fetching student data:", err);
                if (err.response && err.response.status === 404) {
                    setError("No student record found.");
                } else {
                    setError("Error loading dashboard data.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, shouldFetchTeachers]);

    return { ...data, loading, error };
};

export default useStudentData;
