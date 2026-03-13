'use client';

import { useState, useEffect } from 'react';
import { api, Opportunity } from '@/lib/api';

export default function ResumeAnalyzer() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [selectedOppId, setSelectedOppId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<{ matching_skills: string[], missing_skills: string[] } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.fetchOpportunities().then(data => {
            setOpportunities(data);
            if (data.length > 0) setSelectedOppId(data[0].id);
        }).catch(console.error);
    }, []);

    const handleAnalyze = async () => {
        if (!selectedOppId) return;
        setLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            // Always use the profile resume — no manual upload needed
            const result = await api.analyzeResume(selectedOppId, null, true);
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message || 'Analysis failed. Make sure you have uploaded a resume in Profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent relative">
            <div className="max-w-6xl">
                {/* Header */}
                <header className="mb-12 relative">
                    <div className="absolute -left-16 -top-16 w-72 h-72 bg-blue-600/10 rounded-full blur-[80px]" />
                    <h1 className="text-5xl font-black text-white tracking-tighter relative z-10">
                        INTEL<span className="text-blue-500 text-6xl">.</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs mt-2">
                        Resume Intelligence &amp; Skill Matrix Analyser
                    </p>
                </header>

                {/* Control strip — just opportunity selector */}
                <div className="mb-10 p-8 glass rounded-[2rem] border border-white/5 flex flex-col md:flex-row gap-6 items-end relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex-1 w-full">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                            Target Opportunity
                        </label>
                        <select
                            value={selectedOppId || ''}
                            onChange={e => setSelectedOppId(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-bold focus:outline-none focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                        >
                            {opportunities.map(opp => (
                                <option key={opp.id} value={opp.id} className="bg-[#0c1222] text-white">
                                    {opp.company} — {opp.role}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !selectedOppId}
                        className="px-10 py-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-blue-900/40 disabled:opacity-40 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Processing...
                            </span>
                        ) : 'Start Intel Pulse →'}
                    </button>
                </div>

                {/* Profile resume notice */}
                <div className="mb-8 flex items-center gap-3 px-5 py-3 rounded-xl bg-blue-500/8 border border-blue-500/20 text-blue-300 text-xs font-bold">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Using resume from your <a href="/profile" className="underline text-blue-200 hover:text-white mx-1">Profile</a>. Upload a new resume there to update your skills.
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-8 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm">
                        ⚠ {error}
                    </div>
                )}

                {/* Results */}
                <div className="glass-card !p-10 relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
                    <h2 className="font-black text-2xl text-white mb-8 flex items-center gap-4 tracking-tight">
                        Skill Matrix Pulse
                        {analysis && (
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border border-emerald-500/20 bg-emerald-500/8 rounded-full">
                                ✓ Synchronised
                            </span>
                        )}
                    </h2>

                    {!analysis ? (
                        <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                            <p className="text-slate-500 font-bold text-lg tracking-tight">
                                Select an opportunity and click "Start Intel Pulse" to analyse your fit.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* Matching */}
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-[0.3em] flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    Matching Core Competencies ({analysis.matching_skills.length})
                                </p>
                                {analysis.matching_skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-3">
                                        {analysis.matching_skills.map((skill, i) => (
                                            <span key={i} className="px-5 py-2.5 bg-emerald-500/8 text-emerald-300 rounded-2xl text-sm font-bold border border-emerald-500/20">
                                                ✓ {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-600 text-sm font-bold">No matching skills found.</p>
                                )}
                            </div>

                            {/* Missing */}
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-[0.3em] flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                    Critical Intelligence Gaps ({analysis.missing_skills.length})
                                </p>
                                {analysis.missing_skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-3">
                                        {analysis.missing_skills.map((skill, i) => (
                                            <span key={i} className="px-5 py-2.5 bg-rose-500/8 text-rose-300 rounded-2xl text-sm font-bold border border-rose-500/20">
                                                ↑ {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-emerald-400 font-bold text-sm">🎉 You have all required skills for this role!</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
