import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AIChat from './AIChat';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-background relative overflow-hidden transition-colors duration-300">
            {/* Background elements */}
            <div className="fixed -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="fixed top-1/2 -right-24 w-80 h-80 bg-accent/10 rounded-full blur-[80px] pointer-events-none"></div>

            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen relative z-0">
                <Navbar />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
                <AIChat />
            </div>
        </div>
    );
};

export default Layout;
