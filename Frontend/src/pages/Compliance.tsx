import { ShieldCheck } from 'lucide-react';

export default function Compliance() {
    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Compliance Tracking</h1>
                    <p className="text-slate-400 mt-1">Monitor mandatory forms, IDs, and regional requirements.</p>
                </div>
            </header>

            <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8 text-rose-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Compliance Engine Coming Soon</h2>
                <p className="text-slate-400 max-w-md">
                    This section of the UPWARD platform is currently under development. Automated verification status will sit here.
                </p>
            </div>
        </div>
    );
}
