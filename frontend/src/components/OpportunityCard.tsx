'use client';
import React, { useState } from 'react';

interface OpportunityCardProps {
  id: number;
  company: string;
  role: string;
  type: string;
  deadline: string;
  skills?: string;
  description?: string;
  link?: string;
  match_score?: number;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  id, company, role, type, deadline, skills, description, link, match_score
}) => {
  const [open, setOpen] = useState(false);

  const getCompanyLogo = (name: string) => {
    const firstChar = name.charAt(0).toUpperCase();
    return (
      <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-900/30 group-hover:scale-110 transition-transform duration-500">
        {firstChar}
      </div>
    );
  };

  const skillList = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <>
      {/* Card */}
      <div className="glass-card group flex flex-col h-full relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all" />

        <div className="flex justify-between items-start mb-8">
          {getCompanyLogo(company)}
          <div className="flex flex-col items-end gap-2">
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-blue-400">
              {type}
            </div>
            {match_score !== undefined && match_score > 0 && (
              <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${match_score > 70 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                {match_score}% Match
              </div>
            )}
          </div>
        </div>

        <div className="flex-grow">
          <h3 className="text-2xl font-black text-white leading-tight group-hover:translate-x-1 transition-transform">
            {role}
          </h3>
          <p className="text-slate-500 font-bold mt-2 uppercase text-[11px] tracking-[0.2em]">
            {company}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {skillList.slice(0, 3).map((skill, i) => (
              <span key={i} className="px-3 py-1.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[10px] font-bold text-slate-300">
                {skill}
              </span>
            ))}
            {skillList.length > 3 && (
              <span className="text-[10px] text-slate-600 font-bold ml-1">+{skillList.length - 3} more</span>
            )}
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Action Threshold</p>
            <p className="text-lg font-black text-white">{deadline}</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-500 transition-all transform hover:scale-105 active:scale-90"
            title="View Details"
          >
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl border border-white/10 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0f1729 0%, #0c1222 100%)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
              animation: 'modalIn 0.25s ease-out'
            }}
          >
            {/* Header gradient bar */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

            <div className="p-8">
              {/* Top row */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/40">
                    {company.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white leading-tight">{role}</h2>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">{company}</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-black uppercase tracking-widest text-blue-400">
                  {type}
                </span>
                {match_score !== undefined && match_score > 0 && (
                  <span className={`px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest ${match_score > 70 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                    {match_score}% Match
                  </span>
                )}
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  ⏱ {deadline}
                </span>
              </div>

              {/* Description */}
              {description && (
                <div className="mb-6">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Email Summary</h3>
                  <div className="rounded-2xl bg-white/3 border border-white/5 p-4 max-h-52 overflow-y-auto custom-scroll">
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{description}</p>
                  </div>
                </div>
              )}

              {/* Skills */}
              {skillList.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillList.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[11px] font-bold text-slate-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action row */}
              <div className="flex gap-3 pt-4 border-t border-white/5 mt-2">
                {link && link.startsWith('http') ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm text-center hover:opacity-90 transition-opacity"
                  >
                    Apply Now →
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-500 font-black text-sm cursor-not-allowed"
                  >
                    No Direct Link
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black text-sm hover:bg-white/10 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes modalIn {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            .custom-scroll::-webkit-scrollbar { width: 4px; }
            .custom-scroll::-webkit-scrollbar-track { background: transparent; }
            .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
          `}</style>
        </div>
      )}
    </>
  );
};

export default OpportunityCard;
