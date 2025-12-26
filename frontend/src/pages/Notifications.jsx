import { useState } from 'react';
import Card from '../components/Card';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaBell } from 'react-icons/fa';

const Notifications = () => {
    // Mock Data - In a real app, this would come from an API
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'New task assigned: "Website Redesign"', time: '2 mins ago', type: 'info', read: false },
        { id: 2, text: 'Invoice #1023 was paid', time: '1 hour ago', type: 'success', read: false },
        { id: 3, text: 'Server usage high (85%)', time: '3 hours ago', type: 'warning', read: true },
        { id: 4, text: 'Client "Acme Corp" added', time: '5 hours ago', type: 'info', read: true },
        { id: 5, text: 'Weekly report generated', time: '1 day ago', type: 'success', read: true },
    ]);

    const markAsRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-textPrimary">Notifications</h1>
                    <p className="text-textMuted">Stay updated with latest activities</p>
                </div>
                <button
                    onClick={markAllRead}
                    className="text-primary hover:text-teal-700 text-sm font-medium transition-colors"
                >
                    Mark all as read
                </button>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className="mt-1 flex-shrink-0">
                                    {notif.type === 'success' ? <FaCheckCircle className="text-green-500 text-xl" /> :
                                        notif.type === 'warning' ? <FaExclamationCircle className="text-orange-500 text-xl" /> :
                                            <FaInfoCircle className="text-blue-500 text-xl" />}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm ${!notif.read ? 'font-semibold text-textPrimary' : 'text-gray-600'}`}>
                                        {notif.text}
                                    </p>
                                    <p className="text-xs text-textMuted mt-1">{notif.time}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {!notif.read && (
                                        <button
                                            onClick={() => markAsRead(notif.id)}
                                            className="text-xs text-primary font-medium hover:underline"
                                        >
                                            Mark read
                                        </button>
                                    )}
                                    {/* <button 
                                        onClick={() => deleteNotification(notif.id)}
                                        className="text-xs text-red-400 hover:text-red-500"
                                    >
                                        Delete
                                    </button> */}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center flex flex-col items-center text-textMuted">
                            <FaBell className="text-4xl mb-3 text-gray-200" />
                            <p>No notifications yet</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Notifications;
