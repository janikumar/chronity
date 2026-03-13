'use client';

import { useState, useEffect } from 'react';
import { api, Opportunity, PlanResult } from '@/lib/api';

// ─── Colour helpers ────────────────────────────────────────────────────────────
const pct2color = (p: number) =>
    p >= 70 ? '#22c55e' : p >= 40 ? '#f59e0b' : '#ef4444';

export default function WorkPlanner() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [selectedOppId, setSelectedOppId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<PlanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'gap' | 'schedule' | 'interview' | 'resources'>('gap');

    useEffect(() => {
        api.fetchOpportunities().then(data => {
            setOpportunities(data);
            if (data.length > 0) setSelectedOppId(data[0].id);
        }).catch(() => { });
    }, []);

    const handleGenerate = async () => {
        if (!selectedOppId) return;
        setLoading(true);
        setError(null);
        setPlan(null);
        try {
            const result = await api.generatePlan(selectedOppId);
            setPlan(result);
            setActiveTab('gap');
        } catch (err: any) {
            setError(err.message || 'Failed to generate plan. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const selectedOpp = opportunities.find(o => o.id === selectedOppId);

    return (
        <div className="min-h-screen bg-transparent relative">
            {/* Header */}
            <header className="mb-12 relative">
                <div className="absolute -left-20 -top-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[80px]" />
                <h1 className="text-5xl font-black text-white tracking-tighter relative z-10">
                    PLANNER<span className="text-indigo-400 text-6xl">.</span>
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs mt-2">
                    Skill Gap Analyser &amp; Interview Preparation Engine
                </p>
            </header>

            {/* Control Strip */}
            <div className="mb-10 p-8 glass rounded-[2rem] border border-white/5 flex flex-col md:flex-row gap-6 items-end relative overflow-hidden max-w-5xl">
                <div className="absolute right-0 top-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex-1 w-full">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                        Select Opportunity
                    </label>
                    <select
                        value={selectedOppId || ''}
                        onChange={e => setSelectedOppId(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-bold focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                    >
                        {opportunities.map(opp => (
                            <option key={opp.id} value={opp.id} className="bg-[#0c1222] text-white">
                                {opp.company} — {opp.role}{opp.deadline ? ` · ${opp.deadline}` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Quick info chips */}
                {selectedOpp && (
                    <div className="flex flex-wrap gap-2 min-w-fit">
                        {selectedOpp.deadline && (
                            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                                📅 {selectedOpp.deadline}
                            </span>
                        )}
                        {selectedOpp.type && (
                            <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-widest">
                                {selectedOpp.type}
                            </span>
                        )}
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={loading || !selectedOppId}
                    className="px-10 py-4 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-900/40 disabled:opacity-40 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                >

                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Analysing...
                        </span>
                    ) : 'Run Analysis →'}
                </button>
            </div>

            {/* Profile resume notice */}
            <div className="mb-6 max-w-5xl flex items-center gap-3 px-5 py-3 rounded-xl bg-indigo-500/8 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Skills are automatically sourced from your uploaded Profile Resume. Go to&nbsp;<a href="/profile" className="underline text-indigo-200 hover:text-white">Profile</a>&nbsp;to update them.
            </div>

            {/* Error */}
            {error && (
                <div className="mb-8 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm">
                    ⚠ {error}
                </div>
            )}

            {/* Empty state */}
            {!plan && !loading && !error && (
                <div className="py-32 text-center glass rounded-[3rem] border-2 border-dashed border-white/5 max-w-5xl">
                    <p className="text-slate-500 font-bold text-lg tracking-tight">Select an opportunity and click "Run Analysis" to generate your personalised plan.</p>
                </div>
            )}

            {/* Results */}
            {plan && (
                <div className="max-w-6xl space-y-8">
                    {/* Hero stat row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {[
                            { label: 'Match Score', value: `${plan.match_score}%`, color: pct2color(plan.match_score), accent: 'indigo' },
                            { label: 'Skills Matched', value: plan.matched_skills.length, accent: 'emerald' },
                            { label: 'Skills to Learn', value: plan.missing_skills.length, accent: 'amber' },
                            { label: 'Days Remaining', value: plan.days_remaining, accent: 'blue' },
                        ].map((s, i) => (
                            <div key={i} className="glass p-6 rounded-[1.75rem] border border-white/5 relative overflow-hidden group">
                                <div className={`absolute -right-3 -bottom-3 w-20 h-20 bg-${s.accent}-500/8 rounded-full blur-2xl group-hover:scale-150 transition-transform`} />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{s.label}</p>
                                <p className="text-4xl font-black" style={{ color: s.color || 'white' }}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Match progress bar */}
                    <div className="glass p-6 rounded-[1.75rem] border border-white/5">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Skill Compatibility</p>
                            <p className="text-sm font-black text-white">{plan.match_score}% match</p>
                        </div>
                        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ width: `${plan.match_score}%`, background: `linear-gradient(90deg, ${pct2color(plan.match_score)}, ${pct2color(plan.match_score)}88)` }}
                            />
                        </div>
                    </div>

                    {/* Tab bar */}
                    <div className="flex gap-2 flex-wrap">
                        {[
                            { key: 'gap', label: 'Skill Gap' },
                            { key: 'schedule', label: 'Study Schedule' },
                            { key: 'interview', label: 'Interview Prep' },
                            { key: 'resources', label: 'Resources' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === tab.key
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/40'
                                    : 'glass border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── TAB: Skill Gap ── */}
                    {activeTab === 'gap' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Your Profile Skills */}
                            <div className="md:col-span-2 glass-card !p-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-r-full" />
                                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                                    Your Profile Resume Skills ({plan.candidate_skills.length})
                                </h3>
                                {plan.candidate_skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {plan.candidate_skills.map((s, i) => (
                                            <span key={i} className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs font-bold">{s}</span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm">
                                        No skills found. <a href="/profile" className="text-indigo-400 underline hover:text-indigo-200">Upload your resume</a> in Profile so we can accurately analyse your fit.
                                    </p>
                                )}
                            </div>
                            {/* Matched */}
                            <div className="glass-card !p-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-r-full" />
                                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Confirmed Skills ({plan.matched_skills.length})
                                </h3>
                                {plan.matched_skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {plan.matched_skills.map((s, i) => (
                                            <span key={i} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
                                                ✓ {s}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm">No skills matched. Upload your resume in Profile to improve accuracy.</p>
                                )}
                            </div>

                            {/* Missing */}
                            <div className="glass-card !p-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-r-full" />
                                <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                    Skills to Acquire ({plan.missing_skills.length})
                                </h3>
                                {plan.missing_skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {plan.missing_skills.map((s, i) => (
                                            <span key={i} className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                                                ↑ {s}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-emerald-400 font-bold text-sm">🎉 You already have all required skills!</p>
                                )}
                            </div>

                            {/* Strategy */}
                            {plan.strategy && (
                                <div className="md:col-span-2 glass-card !p-8 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-r-full" />
                                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">AI Strategy Brief</h3>
                                    <p className="text-slate-300 leading-relaxed font-medium text-base">{plan.strategy}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB: Study Schedule ── */}
                    {activeTab === 'schedule' && (
                        <div className="glass-card !p-8 relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                                {plan.days_remaining}-Day Preparation Timeline
                            </h3>
                            <div className="space-y-4">
                                {plan.daily_plan.map((phase, i) => (
                                    <div key={i} className="flex gap-5 group">
                                        {/* Timeline dot */}
                                        <div className="flex flex-col items-center pt-1">
                                            <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-indigo-300/30 shrink-0 group-hover:scale-125 transition-transform" />
                                            {i < plan.daily_plan.length - 1 && (
                                                <div className="w-px flex-1 bg-white/5 mt-1" />
                                            )}
                                        </div>
                                        {/* Content */}
                                        <div className="pb-6 flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-lg">
                                                    {phase.day_range}
                                                </span>
                                                <span className="font-black text-white text-sm">{phase.focus}</span>
                                            </div>
                                            <ul className="space-y-2">
                                                {phase.tasks.map((task, j) => (
                                                    <li key={j} className="flex items-start gap-2 text-slate-400 text-sm">
                                                        <span className="text-indigo-500 mt-0.5 shrink-0">›</span>
                                                        {task}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── TAB: Interview Prep ── */}
                    {activeTab === 'interview' && (
                        <div className="glass-card !p-8">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                Interview Intelligence for {plan.role} at {plan.company}
                            </h3>
                            <div className="space-y-4">
                                {plan.interview_tips.map((tip, i) => (
                                    <div key={i} className="flex gap-5 p-5 rounded-2xl bg-white/3 border border-white/5 hover:border-purple-500/20 hover:bg-purple-500/5 transition-all group">
                                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-black text-purple-400 text-sm shrink-0 group-hover:scale-110 transition-transform">
                                            {i + 1}
                                        </div>
                                        <p className="text-slate-300 font-medium text-sm leading-relaxed pt-1">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── TAB: Resources ── */}
                    {activeTab === 'resources' && (
                        <div className="glass-card !p-8">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                Recommended Learning Resources
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {plan.resources.map((r, i) => (
                                    <a
                                        key={i}
                                        href={r.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-5 rounded-2xl bg-white/3 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg shrink-0 group-hover:scale-110 transition-transform">
                                            {r.type === 'Practice' ? '⚡' : r.type === 'Book' ? '📖' : '🎓'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-white text-sm truncate">{r.title}</p>
                                            <p className="text-slate-500 text-xs font-bold mt-0.5">{r.type}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide shrink-0 ${r.priority === 'High'
                                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            : 'bg-slate-500/10 text-slate-400 border border-white/10'
                                            }`}>
                                            {r.priority}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
