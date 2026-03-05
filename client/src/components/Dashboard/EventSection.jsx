import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const EventSection = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventToDelete, setEventToDelete] = useState(null);
    const { user } = useAuth();
    const token = user?.token;

    const fetchEvents = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/events', config);
            setEvents(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching events", error);
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!eventToDelete) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`/api/events/${eventToDelete}`, config);
            setEvents(events.filter(event => event._id !== eventToDelete));
            setEventToDelete(null);
            setSelectedEvent(null);
        } catch (error) {
            console.error("Error deleting event", error);
            alert("Failed to delete event.");
        }
    };

    useEffect(() => {
        if (token) fetchEvents();
    }, [token]);

    if (loading) return <p className="text-gray-500">Loading events...</p>;

    return (
        <div className="bg-white p-6 rounded shadow mt-6">
            <h2 className="text-xl font-bold mb-4">School Events & Notifications</h2>

            {events.length === 0 ? (
                <p className="text-gray-500">No upcoming events.</p>
            ) : (
                <div className="space-y-3">
                    {events.map(event => (
                        <div
                            key={event._id}
                            onClick={() => setSelectedEvent(event)}
                            className="border p-3 rounded hover:bg-gray-50 cursor-pointer transition flex justify-between items-center"
                        >
                            <div>
                                <h3 className="font-semibold text-blue-600">{event.title}</h3>
                                <p className="text-sm text-gray-500">
                                    Posted by {event.authorName} ({event.authorRole}) on {new Date(event.date).toLocaleDateString()}
                                </p>
                            </div>
                            <span className="text-gray-400 text-sm">Click to view</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Event Details Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg mx-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{selectedEvent.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {new Date(selectedEvent.date).toLocaleDateString()} • By {selectedEvent.authorName}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="border-t pt-4">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {selectedEvent.description}
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            {user?.role === 'Principal' && (
                                <button
                                    onClick={() => setEventToDelete(selectedEvent._id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                >
                                    Delete
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Confirm Delete Modal */}
            {eventToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-xl w-full max-w-sm mx-4 transform transition-all">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Deletion</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setEventToDelete(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventSection;
