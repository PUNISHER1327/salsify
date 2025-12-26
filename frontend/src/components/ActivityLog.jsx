import { FaCheckCircle, FaPlus, FaMoneyBillWave, FaUser } from 'react-icons/fa';

const ActivityLog = () => {
    // Mock data - in a real app, this would come from an API
    const activities = [
        { id: 1, text: 'New task "Website Redesign" created', time: '2 mins ago', type: 'task', icon: <FaPlus className="text-blue-500" /> },
        { id: 2, text: 'Invoice #1023 paid by Client A', time: '1 hour ago', type: 'invoice', icon: <FaMoneyBillWave className="text-green-500" /> },
        { id: 3, text: 'Task "Fix Login Bug" completed', time: '3 hours ago', type: 'completion', icon: <FaCheckCircle className="text-primary" /> },
        { id: 4, text: 'New client "TechCorp" added', time: '5 hours ago', type: 'client', icon: <FaUser className="text-orange-500" /> },
    ];

    return (
        <div className="glass-panel p-6 h-full">
            <h3 className="text-xl font-bold text-textPrimary mb-6">Recent Activity</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {activities.map((activity) => (
                    <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            {activity.icon}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white/50 shadow-sm">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                                <span className="font-bold text-textPrimary text-sm">{activity.type.toUpperCase()}</span>
                                <time className="font-caveat font-medium text-xs text-indigo-500">{activity.time}</time>
                            </div>
                            <div className="text-textMuted text-sm">{activity.text}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityLog;
