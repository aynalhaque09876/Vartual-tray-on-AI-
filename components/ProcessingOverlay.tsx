
import React from 'react';
import { ProcessingState } from '../types';

interface ProcessingOverlayProps {
  state: ProcessingState;
}

const STAGES = [
  { id: 'analysis', label: 'Identity Extraction', detail: 'Parsing facial geometry and posture locks...' },
  { id: 'extracting', label: 'Anatomy Mapping', detail: 'Calibrating body proportions 1:1...' },
  { id: 'rendering', label: 'Neural Synthesis', detail: 'Synthesizing fabric drape and studio lighting...' },
  { id: 'validating', label: 'Production Audit', detail: 'Verifying absolute design lock compliance...' }
];

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ state }) => {
  const currentIndex = STAGES.findIndex(s => s.id === state.stage);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl">
      <div className="max-w-2xl w-full p-16 text-center">
        <div className="mb-20 relative flex justify-center">
          <div className="w-48 h-48 border border-zinc-900 rounded-full flex items-center justify-center">
            <div className="w-40 h-40 border-2 border-yellow-500/20 rounded-full flex items-center justify-center animate-pulse">
               <i className="fa-solid fa-sparkles text-5xl text-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.4)]"></i>
            </div>
          </div>
          <div className="absolute inset-0 border-t-2 border-yellow-500 rounded-full animate-spin"></div>
        </div>

        <div className="mb-10">
           <h2 className="text-5xl font-serif italic mb-4 tracking-tighter text-white">Studio Session</h2>
           <div className="flex items-center justify-center space-x-3 text-zinc-600 font-mono text-[10px] uppercase tracking-[0.6em]">
              <span className="w-2 h-2 bg-yellow-600 rounded-full animate-ping"></span>
              <span>ENGINE: PRODUCTION_OPTIMIZED</span>
           </div>
        </div>

        <p className="text-zinc-500 text-[11px] mt-8 mb-20 font-black tracking-[0.4em] uppercase">{state.message}</p>

        <div className="space-y-12 text-left border-l-2 border-white/5 pl-12 ml-6">
          {STAGES.map((stage, idx) => {
            const isActive = state.stage === stage.id;
            const isDone = currentIndex > idx || state.stage === 'completed';
            
            return (
              <div key={stage.id} className="relative group">
                <div className={`absolute -left-[56px] top-1.5 w-6 h-6 rounded-lg border-2 bg-black transition-all duration-700
                  ${isDone ? 'bg-yellow-500 border-yellow-500 scale-110 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : isActive ? 'border-yellow-500 animate-pulse' : 'border-zinc-900'}
                `}>
                  {isDone && <i className="fa-solid fa-check text-[10px] text-black absolute inset-0 flex items-center justify-center"></i>}
                </div>
                <div className="flex-1">
                  <div className={`text-[13px] font-black uppercase tracking-[0.3em] ${isActive || isDone ? 'text-white' : 'text-zinc-800'}`}>
                    {stage.label}
                  </div>
                  {(isActive || isDone) && (
                    <div className="text-[10px] text-zinc-600 mt-2 uppercase font-black tracking-widest leading-relaxed">{stage.detail}</div>
                  )}
                  {isActive && (
                    <div className="w-full bg-zinc-900 h-[2px] mt-6 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div className="h-full bg-yellow-500 shadow-[0_0_15px_#EAB308]" style={{ width: `${state.progress}%`, transition: 'width 0.8s ease' }}></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
