import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Wallet,
    Users,
    BadgeDollarSign,
    CreditCard,
    Cpu,
    BarChart3,
    RefreshCw,
    ShieldCheck
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Properties', icon: Building2, path: '/properties' },
    { name: 'Sales', icon: Wallet, path: '/sales' },
    { name: 'Buyers', icon: Users, path: '/buyers' },
    { name: 'Brokers', icon: BadgeDollarSign, path: '/brokers' },
    { name: 'Payments', icon: CreditCard, path: '/payments' },
    { name: 'AI Engine', icon: Cpu, path: '/ai-engine' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Yardi Sync', icon: RefreshCw, path: '/yardi' },
    { name: 'Compliance', icon: ShieldCheck, path: '/compliance' },
];

export default function Sidebar() {
    return (
        <aside className="w-64 glass-panel border-r border-slate-700/50 flex flex-col m-4 rounded-xl z-20">
            <div className="p-6 border-b border-slate-700/50">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white font-black text-sm">UP</span>
                    </div>
                    UPWARD
                </h1>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Unit Sales Platform</p>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        state={item.path === '/properties' ? { reset: true } : undefined}
                        className={({ isActive }) =>
                            clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            )
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700/50">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                        SJ
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">Sarah Johnson</p>
                        <p className="text-xs text-slate-400">Super Admin</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
