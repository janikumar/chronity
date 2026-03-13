'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OpportunityCard from '@/components/OpportunityCard';
import { api, Opportunity, NotificationItem } from '@/lib/api';


export default function Dashboard() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [acquiredNodes, setAcquiredNodes] = useState(0);
    const [showPulse, setShowPulse] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [backendDown, setBackendDown] = useState(false);
    const [deadlineAlerts, setDeadlineAlerts] = useState<NotificationItem[]>([]);
    const [alertsDismissed, setAlertsDismissed] = useState(false);

    // Intel Upload state
    const [intelOpen, setIntelOpen] = useState(false);
    const [intelText, setIntelText] = useState('');
    const [intelLoading, setIntelLoading] = useState(false);
    const [intelResult, setIntelResult] = useState<Record<string, any> | null>(null);
    const [intelError, setIntelError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            setBackendDown(false);
            const data = await api.fetchOpportunities();
            setOpportunities(data);
        } catch (err) {
            console.error("Failed to load opportunities", err);
            setBackendDown(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // Fetch deadline alerts
        api.getNotifications()
            .then(data => setDeadlineAlerts(data.notifications))
            .catch(() => { });
    }, []);


    const handleIntelUpload = async () => {
        if (!intelText.trim()) return;
        setIntelLoading(true);
        setIntelError(null);
        setIntelResult(null);
        try {
            const data = await api.intelUpload(intelText);
            setIntelResult(data.extracted);
            await loadData();
        } catch (err: any) {
            setIntelError(err.message || 'Failed to process. Try adding more details.');
        } finally {
            setIntelLoading(false);
        }
    };

    const closeIntelModal = () => {
        setIntelOpen(false);
        setIntelText('');
        setIntelResult(null);
        setIntelError(null);
    };

    const handleSync = async () => {
        setSyncError(null);
        try {
            setSyncing(true);
            const data = await api.syncEmails();
            setAcquiredNodes(data.processed);
            setShowPulse(true);
            setTimeout(() => setShowPulse(false), 3000);
            await loadData();
        } catch (error: any) {
            console.error("Failed to sync emails:", error);
            if (error?.message?.includes('fetch')) {
                setSyncError('Cannot reach backend server. Make sure it is running on port 8000.');
            } else {
                setSyncError(error?.message || 'Sync failed. Check backend logs.');
            }
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent relative">

            {/* ── Deadline Alert Banner ── */}
            {!alertsDismissed && deadlineAlerts.length > 0 && (
                <div className="mb-6 px-6 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">⏰</span>
                        <div>
                            <p className="text-amber-300 font-black text-sm">
                                {deadlineAlerts.length} {deadlineAlerts.length === 1 ? 'opportunity' : 'opportunities'} closing within 7 days!
                            </p>
                            <p className="text-amber-500/80 text-xs font-bold mt-0.5">
                                {deadlineAlerts.slice(0, 2).map(a => `${a.company} (${a.days_left === 0 ? 'today' : `${a.days_left}d`})`).join(' · ')}
                                {deadlineAlerts.length > 2 && ` · +${deadlineAlerts.length - 2} more`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <Link href="/notifications" className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-all">
                            View Alerts
                        </Link>
                        <button onClick={() => setAlertsDismissed(true)} className="text-amber-500 hover:text-white transition-colors text-lg">✕</button>
                    </div>
                </div>
            )}

            {/* Backend Down Banner */}
            {backendDown && (
                <div className="mb-6 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <span>Backend server is unreachable. Make sure it is running on port 8000.</span>
                </div>
            )}


            {/* Sync Error Banner */}
            {syncError && (
                <div className="mb-6 px-6 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-sm flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🔌</span>
                        <span>{syncError}</span>
                    </div>
                    <button onClick={() => setSyncError(null)} className="text-amber-500 hover:text-white transition-colors">✕</button>
                </div>
            )}

            {/* Hero Section */}
            <header className="mb-16 relative">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse-glow" />
                <div className="flex justify-between items-end relative z-10">
                    <div>
                        <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">
                            RADAR<span className="text-blue-500 text-7xl">.</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">
                            Opportunity Intelligence Dashboard
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className={`group relative overflow-hidden px-8 py-4 glass rounded-2xl border border-white/10 text-sm font-black uppercase tracking-widest transition-all ${syncing ? 'opacity-50' : 'hover:border-blue-500/50 hover:scale-105 active:scale-95'}`}
                        >
                            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-all" />
                            {syncing ? 'Syncing...' : 'Initiate Pulse'}
                        </button>
                        <button
                            onClick={() => { setIntelOpen(true); setIntelResult(null); setIntelError(null); setIntelText(''); }}
                            className="px-8 py-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-900/40 hover:scale-105 active:scale-95 transition-all"
                        >
                            Intel Upload
                        </button>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                {[
                    { label: 'Total Leads', value: opportunities.length, color: 'blue' },
                    { label: 'Intelligence Nodes', value: Array.from(new Set(opportunities.map(o => o.company))).length, color: 'purple' },
                    { label: 'Sync Status', value: syncing ? 'Active' : 'Standby', color: 'emerald' },
                    { label: 'Last Pulse', value: opportunities.length > 0 ? 'Extracted' : 'None', color: 'amber' }
                ].map((stat, i) => (
                    <div key={i} className="glass p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform`} />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
                        <p className="text-4xl font-black text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            <h2 className="text-2xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
                Identified Nodes
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </h2>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3].map(n => <div key={n} className="h-80 glass rounded-[2.5rem] animate-pulse" />)
                ) : opportunities.length > 0 ? (
                    opportunities.map((opp) => (
                        <OpportunityCard key={opp.id} {...opp} />
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center glass rounded-[3rem] border-dashed border-2 border-white/5">
                        <p className="text-slate-500 font-bold text-xl mb-4 tracking-tight">No intelligence detected in current sector.</p>
                        <button onClick={handleSync} className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-blue-400 font-black uppercase tracking-widest text-xs hover:bg-blue-500/10 transition-all">
                            Start Sector Scan
                        </button>
                    </div>
                )}
            </section>

            {/* Radar Insights */}
            <section className="mt-20">
                <div className="glass-card !p-10 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none" />
                    <h2 className="text-3xl font-black text-white mb-10 tracking-tighter">Proximity Radar</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {opportunities.length > 0 ? (
                            opportunities.slice(0, 2).map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all group cursor-default">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-black text-2xl text-blue-400 group-hover:scale-110 transition-transform">
                                            {item.company.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-lg">{item.company}</p>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{item.role}</p>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                        High Confidence
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 font-bold col-span-full py-10 text-center">No high-confidence signals in proximity.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Intel Upload Modal ── */}
            {intelOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
                    onClick={e => { if (e.target === e.currentTarget) closeIntelModal(); }}
                >
                    <div
                        className="w-full max-w-2xl rounded-3xl border border-white/10 overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg,#0f1729 0%,#0c1222 100%)',
                            boxShadow: '0 30px 70px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
                            animation: 'modalIn .25s ease-out'
                        }}
                    >
                        {/* gradient accent bar */}
                        <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-white">Intel Upload</h2>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Paste any job description or opportunity text</p>
                                </div>
                                <button onClick={closeIntelModal} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Success result */}
                            {intelResult ? (
                                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-6 mb-6">
                                    <p className="text-emerald-400 font-black text-sm uppercase tracking-widest mb-4">✓ Opportunity Extracted &amp; Saved</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Company', value: intelResult.company },
                                            { label: 'Role', value: intelResult.role },
                                            { label: 'Type', value: intelResult.type },
                                            { label: 'Deadline', value: intelResult.deadline },
                                        ].map(item => item.value ? (
                                            <div key={item.label} className="bg-white/5 rounded-xl p-3">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                                                <p className="text-white font-bold text-sm mt-1">{item.value}</p>
                                            </div>
                                        ) : null)}
                                    </div>
                                    {intelResult.skills?.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {intelResult.skills.map((s: string, i: number) => (
                                                <span key={i} className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-300">{s}</span>
                                            ))}
                                        </div>
                                    )}
                                    <button onClick={closeIntelModal} className="mt-5 w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm hover:opacity-90 transition-opacity">
                                        Done — View on Dashboard
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Textarea */}
                                    <textarea
                                        className="w-full h-52 rounded-2xl bg-white/5 border border-white/10 text-slate-200 text-sm p-4 resize-none focus:outline-none focus:border-blue-500/50 placeholder-slate-600 font-medium leading-relaxed mb-4"
                                        placeholder="Paste a job description, LinkedIn post, internship notice, hackathon announcement, or any opportunity text here..."
                                        value={intelText}
                                        onChange={e => setIntelText(e.target.value)}
                                    />

                                    {/* Error */}
                                    {intelError && (
                                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
                                            ⚠ {intelError}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleIntelUpload}
                                            disabled={intelLoading || !intelText.trim()}
                                            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {intelLoading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                    </svg>
                                                    Analysing with AI...
                                                </span>
                                            ) : 'Extract & Save →'}
                                        </button>
                                        <button onClick={closeIntelModal} className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black text-sm hover:bg-white/10 transition-all">
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <style>{`
                        @keyframes modalIn { from{opacity:0;transform:scale(.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
                    `}</style>
                </div>
            )}
        </div>
    );
}
