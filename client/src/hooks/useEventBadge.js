import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const useEventBadge = () => {
    const [hasUnread, setHasUnread] = useState(false);
    const { user } = useAuth();

    const checkUnread = async () => {
        if (!user) return;
        try {
            const { data } = await axios.get('/api/events', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (data.length > 0) {
                // Ensure we handle both ISO strings and Date objects correctly
                // The sort order is strictly by 'date' in the controller, so indices 0 is latest
                const latestEventDate = new Date(data[0].date).getTime();
                const lastRead = localStorage.getItem('lastReadEventsTime');

                if (!lastRead || latestEventDate > parseInt(lastRead)) {
                    setHasUnread(true);
                } else {
                    setHasUnread(false);
                }
            }
        } catch (error) {
            console.error("Error checking badge", error);
        }
    };

    const markRead = () => {
        localStorage.setItem('lastReadEventsTime', Date.now().toString());
        setHasUnread(false);
    };

    useEffect(() => {
        checkUnread();
        // Optional: Poll every minute or so? For now, just on mount is fine.
    }, [user]);

    return { hasUnread, markRead, checkUnread };
};

export default useEventBadge;
