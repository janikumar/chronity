'use client';

import { useState, useEffect } from 'react';
import { api, Opportunity } from '@/lib/api';

export default function Calendar() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.fetchOpportunities();
                setOpportunities(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);
    return (
        <div className="min-h-screen bg-transparent relative">
            <h1 className="text-5xl font-black text-white mb-12 tracking-tighter">
                CALENDAR<span className="text-blue-500 text-6xl">.</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <div className="lg:col-span-3 glass rounded-[3rem] border border-white/5 h-[700px] flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-all duration-700" />
                    <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-lg animate-pulse">Grid Synthesis Active</p>
                </div>

                <div className="space-y-8">
                    <h2 className="font-black text-2xl text-white tracking-tight flex items-center gap-3">
                        Deadlines
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                    </h2>
                    <div className="space-y-4">
                        {loading ? (
                            [1, 2, 3].map(n => <div key={n} className="h-24 glass rounded-3xl animate-pulse" />)
                        ) : opportunities.length > 0 ? (
                            opportunities.map((opp) => (
                                <div key={opp.id} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all border-l-4 border-l-blue-600 group cursor-default">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{opp.deadline}</p>
                                    <p className="font-black text-white text-lg group-hover:translate-x-1 transition-transform">{opp.company}</p>
                                    <p className="text-[11px] text-blue-400 font-bold uppercase tracking-wider mt-1">{opp.role}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 font-bold italic text-sm text-center py-10 glass rounded-3xl border-dashed border border-white/5">No deadlines on immediate radar.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
