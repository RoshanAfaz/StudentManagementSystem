import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AddEventForm = ({ onEventAdded }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [msg, setMsg] = useState('');
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('/api/events', { title, description }, config);

            setMsg('Event posted successfully!');
            setTitle('');
            setDescription('');
            if (onEventAdded) onEventAdded(); // Refresh list if callback provided

            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            console.error(error);
            setMsg('Error posting event');
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow mb-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-bold mb-4">Post New Event / Notification</h3>
            {msg && <div className={`p-2 mb-3 rounded ${msg.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="text"
                        placeholder="Event Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>
                <div>
                    <textarea
                        placeholder="Event Details..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border p-2 rounded h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    ></textarea>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto">
                    Post Event
                </button>
            </form>
        </div>
    );
};

export default AddEventForm;
