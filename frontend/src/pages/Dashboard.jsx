import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';
import Card from '../components/Card';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
    BarElement
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { FaUserFriends, FaTasks, FaMoneyBillWave, FaCheckDouble, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import ActivityLog from '../components/ActivityLog';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

const StatCard = ({ title, value, icon, color, trend }) => (
    <div className="glass-card p-6 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500`}>
            <span className={`text-6xl text-${color}-500`}>{icon}</span>
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${color === 'primary' ? 'bg-primary/10 text-primary' : `bg-${color}-500/10 text-${color}-500`}`}>
                    <span className="text-xl">{icon}</span>
                </div>
                {trend && (
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-textPrimary tracking-tight">{value}</h3>
                <p className="text-sm text-textMuted font-medium mt-1">{title}</p>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const { currencySymbol } = useSettings();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        console.log('Dashboard: fetchStats called');
        try {
            // Add timestamp to prevent browser caching and ensure fresh data
            const timestamp = new Date().getTime();
            const url = `/dashboard/stats?_t=${timestamp}`;
            console.log('Dashboard: Fetching from', url);

            const { data } = await api.get(url);
            console.log('Dashboard: Received stats data:', data);

            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Check if window is focused to refetch data when user returns to tab
    useEffect(() => {
        fetchStats();

        const handleFocus = () => {
            fetchStats();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    const doughnutData = {
        labels: ['Completed', 'Pending'],
        datasets: [
            {
                data: [stats?.completionRate || 0, 100 - (stats?.completionRate || 0)],
                backgroundColor: ['#5FB3B3', '#EEF6F6'],
                borderColor: ['#ffffff', '#ffffff'],
                borderWidth: 2,
            },
        ],
    };

    // Mock data for line chart - replace with real data when available
    const lineData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Revenue',
                data: [1200, 1900, 3000, 5000, 4500, stats?.monthlyRevenue || 6000],
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(95, 179, 179, 0.5)');
                    gradient.addColorStop(1, 'rgba(95, 179, 179, 0)');
                    return gradient;
                },
                borderColor: '#5FB3B3',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#5FB3B3',
                pointBorderWidth: 2,
            },
        ],
    };

    const lineOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1F2D2E',
                padding: 12,
                titleFont: { family: 'Outfit', size: 13 },
                bodyFont: { family: 'Inter', size: 13 },
                displayColors: false,
                callbacks: {
                    label: (context) => `${currencySymbol}${context.raw}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'bg-gray-50',
                    drawBorder: false,
                },
                ticks: {
                    font: { family: 'Inter' },
                    color: '#9CA3AF'
                }
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: { family: 'Inter' },
                    color: '#9CA3AF'
                }
            }
        },
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Clients"
                    value={stats?.totalClients || 0}
                    icon={<FaUserFriends />}
                    color="blue"
                    trend={12}
                />
                <StatCard
                    title="Pending Tasks"
                    value={stats?.pendingTasks || 0}
                    icon={<FaTasks />}
                    color="orange"
                    trend={-5}
                />
                <StatCard
                    title="Monthly Revenue"
                    value={`${currencySymbol}${stats?.monthlyRevenue || 0}`}
                    icon={<FaMoneyBillWave />}
                    color="green"
                    trend={8}
                />
                <StatCard
                    title="Completion Rate"
                    value={`${stats?.completionRate || 0}%`}
                    icon={<FaCheckDouble />}
                    color="primary"
                    trend={2}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="glass-card p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-textPrimary">Revenue Trend</h3>
                        <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1 focus:outline-none text-textMuted">
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-72">
                        <Line data={lineData} options={lineOptions} />
                    </div>
                </div>

                {/* Task Distribution */}
                <div className="glass-card p-6 flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold text-textPrimary mb-6 w-full text-left">Task Status</h3>
                    <div className="w-56 h-56 relative">
                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: true, cutout: '75%' }} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-textPrimary">{stats?.completionRate}%</span>
                            <span className="text-xs text-textMuted uppercase tracking-wider">Completed</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Products & Recent Activity */}
            {/* Top Products & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Urgent Tasks */}
                <div className="glass-panel p-6 lg:col-span-2">
                    <h3 className="text-xl font-bold text-textPrimary mb-6">Urgent Tasks</h3>
                    <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                        {stats?.latestTasks?.length > 0 ? (
                            stats.latestTasks.map((task) => (
                                <div key={task._id} className="flex items-center justify-between p-4 bg-white/50 border border-white/60 rounded-xl hover:bg-white/80 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-10 bg-accent rounded-full group-hover:h-12 transition-all duration-300"></div>
                                        <div>
                                            <h4 className="font-semibold text-textPrimary">{task.title}</h4>
                                            <div className="flex items-center gap-2 text-sm text-textMuted">
                                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-600' :
                                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-textMuted bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                <FaCheckDouble className="mx-auto text-4xl mb-3 text-gray-300" />
                                <p>All caught up!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity Log */}
                <div className="lg:col-span-1">
                    <ActivityLog />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
