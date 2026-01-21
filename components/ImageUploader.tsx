
import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
  label: string;
  description: string;
  image: string | null;
  onUpload: (base64: string) => void;
  icon: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, description, image, onUpload, icon }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIsScanning(true);
        onUpload(reader.result as string);
        // Simulate studio calibration
        setTimeout(() => setIsScanning(false), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{label}</h3>
        {image && (
          <button 
            onClick={() => onUpload('')}
            className="text-[10px] font-bold uppercase text-red-500/40 hover:text-red-500 transition-colors tracking-widest"
          >
            Reset
          </button>
        )}
      </div>
      <div 
        onClick={triggerUpload}
        className={`relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-[2.5rem] border transition-all duration-700 flex flex-col items-center justify-center
          ${image ? 'border-white/10 bg-black shadow-2xl' : 'border-zinc-900 hover:border-yellow-500/30 bg-zinc-950/40'}
          ${isScanning ? 'ring-1 ring-yellow-500/50 scale-[0.98]' : ''}
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
        
        {image ? (
          <div className="relative w-full h-full">
            <img src={image} alt={label} className={`h-full w-full object-cover transition-all duration-[2s] ${isScanning ? 'brightness-50 grayscale' : 'brightness-100 scale-100'}`} />
            
            {isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-x-0 h-[3px] bg-yellow-500 shadow-[0_0_30px_#EAB308] animate-[scan_2s_infinite]"></div>
                <div className="z-10 bg-black/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500">Calibrating Pixels...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 flex flex-col items-center text-center group">
            <div className="w-20 h-20 rounded-full border border-zinc-900 flex items-center justify-center mb-8 group-hover:border-yellow-500/20 transition-all duration-700">
               <i className={`fa-solid ${icon} text-3xl text-zinc-900 group-hover:text-yellow-500 transition-all duration-700`}></i>
            </div>
            <p className="text-[12px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed max-w-[120px]">{description}</p>
            <div className="mt-8 flex items-center space-x-3">
               <span className="h-[1px] w-6 bg-zinc-900"></span>
               <span className="text-[9px] text-zinc-800 font-mono uppercase tracking-[0.2em]">Ready For Studio Import</span>
               <span className="h-[1px] w-6 bg-zinc-900"></span>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
