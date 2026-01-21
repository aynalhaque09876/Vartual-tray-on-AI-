
import React, { useState } from 'react';
import { User } from '../types';

interface AuthPortalProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onLogin, onClose }) => {
  const [step, setStep] = useState<'method' | 'otp' | 'admin-password'>('method');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGoogleLogin = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onLogin({
        id: 'G-' + Math.random().toString(36).substr(2, 9),
        name: 'Creative Member',
        email: 'user@gmail.com',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Creative',
        plan: 'Free',
        isLoggedIn: true,
        credits: 100, // New accounts get 100 credits
      });
      setIsProcessing(false);
    }, 2000);
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;

    // Special Admin Bypass
    if (email.toLowerCase() === 'admin@gmail.com') {
      setStep('admin-password');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setStep('otp');
      setIsProcessing(false);
    }, 1500);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'P@s0rde0987') {
      onLogin({
        id: 'ADMIN-001',
        name: 'Master Admin',
        email: 'admin@gmail.com',
        plan: 'Enterprise',
        isLoggedIn: true,
        credits: 99999,
        isAdmin: true
      });
    } else {
      alert("Invalid Admin Credentials.");
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      onLogin({
        id: 'U-' + Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email: email,
        plan: 'Free',
        isLoggedIn: true,
        credits: 100, // New regular users get 100 credits
      });
      setIsProcessing(false);
    }, 2000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="max-w-md w-full glass-panel rounded-[3rem] p-12 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <button onClick={onClose} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-zinc-900 border border-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-user-lock text-yellow-500 text-2xl"></i>
          </div>
          <h2 className="text-3xl font-serif text-white mb-2">Creative Biz</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Secure Access Portal</p>
        </div>

        {step === 'method' && (
          <div className="space-y-8">
            <button 
              onClick={handleGoogleLogin}
              disabled={isProcessing}
              className="w-full py-5 bg-white text-black rounded-2xl font-bold text-sm flex items-center justify-center space-x-4 hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              <span>Continue with Google</span>
            </button>
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                <input 
                  required type="email" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl py-5 px-6 text-sm font-medium text-white outline-none focus:border-yellow-500 transition-all"
                />
              </div>
              <button type="submit" className="w-full py-5 bg-zinc-900 border border-zinc-800 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-800 transition-all">
                NEXT
              </button>
            </form>
          </div>
        )}

        {step === 'admin-password' && (
          <form onSubmit={handleAdminLogin} className="space-y-8">
            <div className="text-center space-y-2 mb-6">
              <p className="text-xs text-yellow-500 font-black uppercase tracking-widest">Admin Authorization Required</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Master Password</label>
              <input 
                required type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-2xl py-5 px-6 text-sm font-medium text-white outline-none focus:border-yellow-500 transition-all"
              />
            </div>
            <button type="submit" className="w-full py-5 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-yellow-400 transition-all active:scale-95">
              AUTHORIZE ADMIN ACCESS
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-10">
            <div className="text-center space-y-2">
              <p className="text-xs text-zinc-400">Enter code sent to {email}</p>
            </div>
            <div className="flex justify-between gap-3">
              {otp.map((digit, idx) => (
                <input 
                  key={idx} id={`otp-${idx}`} required type="text" maxLength={1} value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-full aspect-square bg-black border border-white/10 rounded-xl text-center text-xl font-bold text-yellow-500 focus:border-yellow-500 outline-none transition-all"
                />
              ))}
            </div>
            <button type="submit" className="w-full py-5 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-yellow-400 transition-all active:scale-95">
              COMPLETE SIGN IN
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
