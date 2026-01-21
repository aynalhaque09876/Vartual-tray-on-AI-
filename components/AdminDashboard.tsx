
import React, { useState } from 'react';
import { UserAccount, AdminAnalytics } from '../types';

interface AdminDashboardProps {
  users: UserAccount[];
  onClose: () => void;
  onUpdateCredits?: (email: string, amount: number) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, onClose, onUpdateCredits }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings'>('users');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleOpenTopUp = (user: UserAccount) => {
    setSelectedUser(user);
    setTopUpAmount('');
    setShowSuccess(false);
  };

  const handleConfirmTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !topUpAmount) return;
    
    const amount = parseInt(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    setIsProcessing(true);

    /**
     * Simulation of Backend API Call:
     * POST /api/admin/topup
     * Payload: { userId: selectedUser.id, credits: amount }
     */
    setTimeout(() => {
      if (onUpdateCredits) {
        onUpdateCredits(selectedUser.email, amount);
      }
      setIsProcessing(false);
      setShowSuccess(true);
      
      // Auto-close success message and modal
      setTimeout(() => {
        setSelectedUser(null);
        setShowSuccess(false);
      }, 1500);
    }, 1000);
  };

  const addPredefined = (val: number) => {
    const current = parseInt(topUpAmount) || 0;
    setTopUpAmount((current + val).toString());
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 bg-[#080808] p-10 flex flex-col">
        <div className="flex items-center space-x-3 mb-16">
          <div className="w-10 h-10 flex items-center justify-center text-yellow-500 border border-yellow-500/20 rounded-full">
            <i className="fa-solid fa-shield-halved text-sm"></i>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Admin Hub</span>
        </div>

        <nav className="flex-1 space-y-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'overview' ? 'bg-yellow-500 text-black' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
          >
            <i className="fa-solid fa-house-chimney text-lg"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Overview</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'users' ? 'bg-yellow-500 text-black shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
          >
            <i className="fa-solid fa-users-gear text-lg"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">User & Credits</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-yellow-500 text-black' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
          >
            <i className="fa-solid fa-sliders text-lg"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Model Config</span>
          </button>
        </nav>

        <div className="pt-10 mt-10 border-t border-white/5">
          <button 
            onClick={onClose}
            className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-zinc-500 hover:text-red-500 hover:bg-red-500/5 transition-all"
          >
            <i className="fa-solid fa-door-open text-lg"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Exit Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-16 bg-[#050505]">
        <header className="flex items-center justify-between mb-16">
          <div>
            <h1 className="text-5xl font-serif text-white mb-2 tracking-tight">Enterprise Dashboard</h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em]">Creative Biz Global Operations</p>
          </div>
          <div className="flex items-center space-x-8">
            <div className="text-right">
              <div className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-1">System Status</div>
              <div className="text-[10px] text-green-500 uppercase tracking-widest flex items-center justify-end space-x-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="font-black">All Nodes Operational</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-[#111] rounded-full flex items-center justify-center border border-white/5 cursor-pointer hover:border-white/20 transition-all">
              <i className="fa-solid fa-bell text-zinc-600 text-lg"></i>
            </div>
          </div>
        </header>

        {activeTab === 'users' && (
          <div className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden bg-[#0A0A0A]/80 shadow-2xl">
            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-[#0F0F0F]">
              <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-500">User & Credit Management</h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#111]">
                  <th className="px-12 py-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Identity</th>
                  <th className="px-12 py-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Credits Balance</th>
                  <th className="px-12 py-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="px-12 py-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.01] transition-colors border-b border-white/[0.02]">
                    <td className="px-12 py-10">
                      <div className="flex items-center space-x-6">
                        <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center border border-white/5 text-[12px] font-black text-yellow-500 shadow-inner">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-[13px] font-black text-white uppercase tracking-widest mb-1">{u.name}</div>
                          <div className="text-[10px] text-zinc-600 font-medium tracking-tight">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-10">
                      <div className="flex items-baseline space-x-3">
                         <span className="text-3xl font-bold text-yellow-500 tracking-tight">{u.credits}</span>
                         <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Credits</span>
                      </div>
                    </td>
                    <td className="px-12 py-10">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${u.status === 'active' ? 'text-zinc-300' : 'text-zinc-600'}`}>{u.status}</span>
                      </div>
                    </td>
                    <td className="px-12 py-10">
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={() => handleOpenTopUp(u)}
                          className="px-6 py-2.5 bg-yellow-500 text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-[0_10px_30px_rgba(234,179,8,0.1)] active:scale-95 flex items-center group"
                        >
                          <i className="fa-solid fa-plus mr-2 text-[8px] group-hover:scale-125 transition-transform"></i>
                          Top Up
                        </button>
                        <button className="h-10 w-10 flex items-center justify-center text-zinc-700 hover:text-red-500 transition-all border border-white/5 rounded-lg hover:border-red-500/30">
                          <i className="fa-solid fa-ban text-[14px]"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TOP UP MODAL */}
        {selectedUser && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="max-w-md w-full glass-panel rounded-[3rem] p-12 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden animate-in zoom-in-95 duration-500">
              
              {showSuccess ? (
                <div className="text-center py-10 animate-in fade-in zoom-in-95">
                  <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <i className="fa-solid fa-check text-4xl text-green-500"></i>
                  </div>
                  <h2 className="text-2xl font-serif text-white mb-2 italic">Success!</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Credits Injected Successfully</p>
                </div>
              ) : (
                <>
                  <button onClick={() => setSelectedUser(null)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors">
                    <i className="fa-solid fa-xmark text-xl"></i>
                  </button>

                  <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-zinc-900 border border-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                      <i className="fa-solid fa-bolt-lightning text-yellow-500 text-2xl"></i>
                    </div>
                    <h2 className="text-2xl font-serif text-white mb-1">Top Up Credits</h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Target: {selectedUser.name}</p>
                  </div>

                  <form onSubmit={handleConfirmTopUp} className="space-y-8">
                    <div className="space-y-4">
                      <div className="relative">
                        <input 
                          autoFocus
                          required
                          type="number"
                          placeholder="ENTER AMOUNT"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded-2xl py-6 px-8 text-3xl font-bold text-yellow-500 text-center outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-800"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-700 uppercase tracking-widest">Units</div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {[50, 100, 500].map(val => (
                          <button 
                            key={val}
                            type="button"
                            onClick={() => addPredefined(val)}
                            className="py-3 bg-zinc-900 border border-white/5 rounded-xl text-[10px] font-black text-zinc-400 hover:text-yellow-500 hover:border-yellow-500/30 transition-all active:scale-95"
                          >
                            +{val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-yellow-500/5 rounded-[1.5rem] border border-yellow-500/10 text-center">
                      <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">New Predicted Balance</div>
                      <div className="text-xl font-bold text-white tracking-tight">
                        {selectedUser.credits + (parseInt(topUpAmount) || 0)} <span className="text-[10px] uppercase text-yellow-500">Credits</span>
                      </div>
                    </div>

                    <button 
                      disabled={isProcessing || !topUpAmount}
                      type="submit" 
                      className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] transition-all relative overflow-hidden group
                        ${isProcessing ? 'bg-zinc-800 text-zinc-600 cursor-wait' : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_20px_50px_rgba(234,179,8,0.2)] active:scale-95'}
                      `}
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center space-x-2">
                          <i className="fa-solid fa-circle-notch animate-spin"></i>
                          <span>Synchronizing...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          <span>Confirm Injection</span>
                          <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                        </span>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
