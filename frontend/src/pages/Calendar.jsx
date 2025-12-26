import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../services/api';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';

const localizer = momentLocalizer(moment);

const CalendarView = () => {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksRes, invoicesRes] = await Promise.all([
                    api.get('/tasks'),
                    api.get('/invoices')
                ]);

                const tasks = tasksRes.data.map(task => ({
                    id: task._id,
                    title: `Task: ${task.title}`,
                    start: new Date(task.dueDate),
                    end: new Date(task.dueDate),
                    allDay: true,
                    type: 'task',
                    status: task.status
                }));

                const invoices = invoicesRes.data.map(invoice => ({
                    id: invoice._id,
                    title: `Invoice: $${invoice.amount}`,
                    start: new Date(invoice.dueDate),
                    end: new Date(invoice.dueDate),
                    allDay: true,
                    type: 'invoice',
                    status: invoice.status
                }));

                setEvents([...tasks, ...invoices]);
            } catch (error) {
                console.error("Failed to fetch calendar data", error);
            }
        };

        fetchData();
    }, []);

    const eventStyleGetter = (event) => {
        let backgroundColor = '#3174ad';
        if (event.type === 'task') {
            backgroundColor = event.status === 'completed' ? '#10B981' : '#3B82F6';
        } else if (event.type === 'invoice') {
            backgroundColor = event.status === 'paid' ? '#059669' : '#EF4444';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    const handleSelectEvent = (event) => {
        if (event.type === 'task') {
            navigate('/tasks');
        } else {
            navigate('/invoices');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in h-[calc(100vh-100px)] flex flex-col">
            <div>
                <h1 className="text-3xl font-bold text-textPrimary">Calendar</h1>
                <p className="text-textMuted">View your schedule and due dates</p>
            </div>

            <div className="glass-card p-6 flex-1 text-sm">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={handleSelectEvent}
                    views={['month', 'week', 'day']}
                />
            </div>
        </div>
    );
};

export default CalendarView;
