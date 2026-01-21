
import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';

interface DressToDummyToolProps {
  onGenerate: (image: string, style: string) => void;
  isProcessing: boolean;
}

export const DressToDummyTool: React.FC<DressToDummyToolProps> = ({ onGenerate, isProcessing }) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<'standard' | 'wood' | 'marble'>('standard');

  const handleGenerate = () => {
    if (!sourceImage) return;
    onGenerate(sourceImage, selectedStyle);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-serif text-white">
          Dress-to-Dummy <span className="text-zinc-500 italic">Extractor</span>
        </h2>
        <p className="text-zinc-500 text-sm tracking-wide">
          Isolate outfits cleanly from reference images
        </p>
      </div>

      <div className="glass-panel rounded-[3rem] p-12 border border-white/5 shadow-2xl space-y-12">
        {/* Upload Section */}
        <div className="space-y-6">
          <h3 className="text-center text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">
            Upload Photo of Person Wearing Outfit
          </h3>
          <div className="max-w-sm mx-auto">
            <ImageUploader 
              label="" 
              description="PNG, JPG up to 20MB" 
              image={sourceImage} 
              onUpload={setSourceImage} 
              icon="fa-upload" 
            />
          </div>
        </div>

        {/* Style Selection */}
        <div className="space-y-8">
          <h3 className="text-center text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">
            Select Dummy Style
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => setSelectedStyle('standard')}
              className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border transition-all duration-500 space-y-4
                ${selectedStyle === 'standard' ? 'border-yellow-500 bg-yellow-500/5 ring-1 ring-yellow-500/20' : 'border-white/5 bg-black/40 hover:border-white/10'}
              `}
            >
              <i className="fa-solid fa-shirt text-2xl text-white"></i>
              <span className={`text-[10px] font-black uppercase tracking-widest ${selectedStyle === 'standard' ? 'text-white' : 'text-zinc-500'}`}>Standard</span>
            </button>

            <button 
              onClick={() => setSelectedStyle('wood')}
              className={`flex-col items-center justify-center p-8 rounded-[2rem] border transition-all duration-500 space-y-4
                ${selectedStyle === 'wood' ? 'border-yellow-500 bg-yellow-500/5 ring-1 ring-yellow-500/20' : 'border-white/5 bg-black/40 hover:border-white/10'}
              `}
            >
              <i className="fa-solid fa-tree text-2xl text-white"></i>
              <span className={`text-[10px] font-black uppercase tracking-widest ${selectedStyle === 'wood' ? 'text-white' : 'text-zinc-500'}`}>Premium Wood</span>
            </button>

            <button 
              onClick={() => setSelectedStyle('marble')}
              className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border transition-all duration-500 space-y-4
                ${selectedStyle === 'marble' ? 'border-yellow-500 bg-yellow-500/5 ring-1 ring-yellow-500/20' : 'border-white/5 bg-black/40 hover:border-white/10'}
              `}
            >
              <i className="fa-solid fa-gem text-2xl text-cyan-400"></i>
              <span className={`text-[10px] font-black uppercase tracking-widest ${selectedStyle === 'marble' ? 'text-white' : 'text-zinc-500'}`}>Luxury Marble</span>
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center space-y-6 pt-4">
          <button 
            disabled={!sourceImage || isProcessing}
            onClick={handleGenerate}
            className={`px-16 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all
              ${!sourceImage || isProcessing 
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_20px_60px_rgba(234,179,8,0.2)] active:scale-95'
              }
            `}
          >
            {isProcessing ? 'SYNTHESIZING...' : 'Generate (5 Credits)'}
          </button>
          <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-yellow-500/60">
            <i className="fa-solid fa-gem"></i>
            <span>Neural Synthesis Cost: 5 Credits</span>
          </div>
        </div>
      </div>
    </div>
  );
};
