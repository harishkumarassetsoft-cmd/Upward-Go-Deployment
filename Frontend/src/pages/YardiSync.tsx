import { useState } from 'react';
import { Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';
import axios from 'axios';

import { API_URL } from '../config';
const API_URL_VAR = API_URL;

export default function YardiSync() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [logs, setLogs] = useState([
        { id: 1, action: "Push Sale SL-2026-001", status: "Success", time: "10:42 AM", details: "GL Code: 4010-US (Revenue)" },
        { id: 2, action: "Push Payment Installment PI-008", status: "Success", time: "10:15 AM", details: "GL Code: 1100-CA (Cash in Bank)" },
        { id: 3, action: "Pull Property Inventory", status: "Failed", time: "09:00 AM", details: "API Timeout on Yardi Server" },
    ]);

    const triggerSync = async () => {
        setIsSyncing(true);
        try {
            const res = await axios.post(`${API_URL}/api/yardi/sync`);
            if (res.data.status === 'success') {
                const newLog = {
                    id: Date.now(),
                    action: "Manual Sync Triggered",
                    status: "Success",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    details: res.data.message
                };
                setLogs([newLog, ...logs]);
            }
        } catch (err) {
            console.error(err);
            const errLog = {
                id: Date.now(),
                action: "Manual Sync",
                status: "Failed",
                time: new Date().toLocaleTimeString(),
                details: "Connection to python backend failed."
            };
            setLogs([errLog, ...logs]);
        }
        setIsSyncing(false);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Yardi Voyager Sync</h1>
                    <p className="text-slate-400 mt-1">Manage integration health and trace financial pushes.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Connection Status</h2>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Connected
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                            <div className="text-sm text-slate-400 mb-1">Environment</div>
                            <div className="font-medium text-white">Production (Voyager 7S)</div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1 p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                                <div className="text-sm text-slate-400 mb-1">Last Sync</div>
                                <div className="font-medium text-white">10 Minutes Ago</div>
                            </div>
                            <div className="flex-1 p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                                <div className="text-sm text-slate-400 mb-1">Queued Records</div>
                                <div className="font-medium text-amber-400">12 Pending</div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={triggerSync}
                        disabled={isSyncing}
                        className="w-full mt-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSyncing ? (
                            <Activity className="w-5 h-5 animate-spin" />
                        ) : (
                            <Activity className="w-5 h-5" />
                        )}
                        Force Sync Now
                    </button>
                </div>

                <div className="glass-panel p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-slate-400">Daily Success Rate</h3>
                        <div className="text-4xl font-bold text-white mt-2">98.2%</div>
                        <p className="text-xs text-slate-500 mt-2">412 transactions pushed today.</p>
                    </div>

                    <div className="space-y-3 mt-6 border-t border-slate-700/50 pt-6">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Total Failed</span>
                            <span className="text-rose-400 font-medium">3</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">API Latency</span>
                            <span className="text-emerald-400 font-medium">124ms</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel mt-6">
                <div className="p-4 border-b border-slate-700/50">
                    <h2 className="text-lg font-semibold text-white">Event Log</h2>
                </div>
                <div className="divide-y divide-slate-700/50">
                    {logs.map(log => (
                        <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-start gap-3">
                                {log.status === 'Success' ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                                ) : log.status === 'Failed' ? (
                                    <XCircle className="w-5 h-5 text-rose-400 mt-0.5" />
                                ) : (
                                    <Clock className="w-5 h-5 text-amber-400 mt-0.5" />
                                )}
                                <div>
                                    <p className="font-medium text-slate-200">{log.action}</p>
                                    <p className="text-sm text-slate-400 mt-0.5">{log.details}</p>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block mb-1
                  ${log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' :
                                        log.status === 'Failed' ? 'bg-rose-500/10 text-rose-400' :
                                            'bg-amber-500/10 text-amber-400'}`}>
                                    {log.status}
                                </span>
                                <p className="text-xs text-slate-500">{log.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
