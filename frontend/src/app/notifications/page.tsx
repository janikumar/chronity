'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, NotificationItem } from '@/lib/api';

function UrgencyBadge({ days }: { days: number }) {
    if (days === 0) return <span className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-[10px] font-black uppercase tracking-widest animate-pulse">TODAY</span>;
    if (days === 1) return <span className="px-2.5 py-1 rounded-lg bg-red-500/80 text-white text-[10px] font-black uppercase tracking-widest">1 Day</span>;
    if (days <= 3) return <span className="px-2.5 py-1 rounded-lg bg-amber-500/80 text-white text-[10px] font-black uppercase tracking-widest">{days} Days</span>;
    return <span className="px-2.5 py-1 rounded-lg bg-yellow-600/60 text-yellow-200 text-[10px] font-black uppercase tracking-widest">{days} Days</span>;
}

export default function NotificationsPage() {
    const [notifs, setNotifs] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.getNotifications()
            .then(data => setNotifs(data.notifications))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-transparent">
            {/* Header */}
            <header className="mb-12 relative">
                <div className="absolute -left-16 -top-16 w-72 h-72 bg-amber-600/10 rounded-full blur-[80px]" />
                <div className="flex items-end gap-4 relative z-10">
                    <h1 className="text-5xl font-black text-white tracking-tighter">
                        ALERTS<span className="text-amber-400 text-6xl">.</span>
                    </h1>
                    {notifs.length > 0 && (
                        <span className="mb-3 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black">{notifs.length} Expiring</span>
                    )}
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs mt-2">
                    Opportunities closing within 7 days — act now
                </p>
            </header>

            {loading && (
                <div className="space-y-4">
                    {[1, 2, 3].map(n => <div key={n} className="h-48 glass rounded-[2rem] animate-pulse" />)}
                </div>
            )}

            {error && (
                <div className="px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm">
                    ⚠ {error} — Make sure the backend is running.
                </div>
            )}

            {!loading && !error && notifs.length === 0 && (
                <div className="py-32 text-center glass rounded-[3rem] border-2 border-dashed border-white/5">
                    <p className="text-4xl mb-4">🎉</p>
                    <p className="text-slate-400 font-bold text-lg tracking-tight">No urgent deadlines in the next 7 days.</p>
                    <p className="text-slate-600 text-sm mt-2 font-medium">You're all caught up. Check back daily.</p>
                </div>
            )}

            {!loading && notifs.length > 0 && (
                <div className="space-y-6 max-w-4xl">
                    {notifs.map((n, i) => (
                        <div key={n.id} className={`glass-card !p-0 overflow-hidden relative border ${n.days_left <= 1 ? 'border-red-500/30' : n.days_left <= 3 ? 'border-amber-500/20' : 'border-white/5'}`}>
                            {/* Urgency stripe */}
                            <div className={`h-1 w-full ${n.days_left === 0 ? 'bg-red-500 animate-pulse' : n.days_left <= 1 ? 'bg-red-500' : n.days_left <= 3 ? 'bg-amber-500' : 'bg-yellow-600'}`} />

                            <div className="p-8">
                                {/* Top row */}
                                <div className="flex items-start justify-between gap-4 mb-5">
                                    <div className="flex items-center gap-4">
                                        {/* Company avatar */}
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 ${n.days_left <= 1 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                            {n.company?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-xl leading-tight">{n.company}</p>
                                            <p className="text-slate-400 font-bold text-sm mt-0.5">{n.role}</p>
                                            {n.type && (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{n.type}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <UrgencyBadge days={n.days_left} />
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Deadline: {n.deadline}</p>
                                    </div>
                                </div>

                                {/* Why Apply — AI pitch */}
                                {n.why_apply && (
                                    <div className={`mb-5 p-4 rounded-2xl border ${n.days_left <= 1 ? 'bg-red-500/5 border-red-500/15' : n.days_left <= 3 ? 'bg-amber-500/5 border-amber-500/15' : 'bg-white/3 border-white/5'}`}>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">🤖 Why You Should Apply</p>
                                        <p className="text-slate-200 font-medium text-sm leading-relaxed">{n.why_apply}</p>
                                    </div>
                                )}

                                {/* Skill match row */}
                                <div className="flex flex-wrap gap-3 mb-5">
                                    {/* Match score */}
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: n.match_score >= 70 ? '#22c55e' : n.match_score >= 40 ? '#f59e0b' : '#ef4444' }} />
                                        <span className="text-[11px] font-black text-slate-300">{n.match_score}% Match</span>
                                    </div>
                                    {/* Matched skills */}
                                    {n.matched_skills.slice(0, 4).map((s, j) => (
                                        <span key={j} className="px-3 py-1 rounded-lg bg-emerald-500/8 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold">✓ {s}</span>
                                    ))}
                                    {/* Missing skills count */}
                                    {n.skills.length > n.matched_skills.length && (
                                        <span className="px-3 py-1 rounded-lg bg-amber-500/8 border border-amber-500/20 text-amber-300 text-[11px] font-bold">
                                            +{n.skills.length - n.matched_skills.length} to learn
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    {n.link ? (
                                        <a
                                            href={n.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${n.days_left <= 1 ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-900/30' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-900/20'}`}
                                        >
                                            Apply Now →
                                        </a>
                                    ) : (
                                        <span className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 font-black text-sm text-slate-500 uppercase tracking-widest">No Direct Link</span>
                                    )}
                                    <Link
                                        href="/planner"
                                        className="px-6 py-3 rounded-2xl glass border border-white/10 font-black text-sm text-slate-300 uppercase tracking-widest hover:border-indigo-500/30 hover:text-white transition-all"
                                    >
                                        Plan Prep
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
