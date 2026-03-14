import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            setUser(userInfo);
        }
        setLoading(false);
    }, []);

    const login = async (email, pendingPassword, role) => {
        // Note: The backend login takes email/studentId and password. 
        // The UI might need to handle differentiation or just send as 'email' or 'studentId'.
        // Here simplifying to take generic 'identifier' and 'password'.
        try {
            // Determine if email or studentId based on input or logic?
            // Backend expects { email: ..., password: ... } OR { studentId: ..., password: ... }
            // Let's assume the Login component handles constructing the body.
            // But actually, let's just make this function generic.

            // Correct approach: Pass the whole body object
        } catch (error) {
            throw error;
        }
    };

    // Re-implementing simplified version
    const loginAction = async (credentials) => {
        try {
            const { data } = await axios.post('/api/auth/login', credentials);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return data;
        } catch (error) {
            throw error.response?.data?.message || error.message;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    const updateUser = (updatedUserInfo) => {
        const newUserInfo = { ...user, ...updatedUserInfo };
        setUser(newUserInfo);
        localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
    };

    return (
        <AuthContext.Provider value={{ user, login: loginAction, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
