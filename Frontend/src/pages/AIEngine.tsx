import { Cpu } from 'lucide-react';

export default function AIEngine() {
    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">AI Abstraction Engine</h1>
                    <p className="text-slate-400 mt-1">Upload and automatically abstract sales contracts.</p>
                </div>
            </header>

            <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                    <Cpu className="w-8 h-8 text-fuchsia-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">AI Extraction Services Coming Soon</h2>
                <p className="text-slate-400 max-w-md">
                    This section of the UPWARD platform is currently under development. AI document ingestion will be available here.
                </p>
            </div>
        </div>
    );
}
