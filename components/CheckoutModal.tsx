
import React, { useState } from 'react';

interface CheckoutModalProps {
  plan: {
    name: string;
    price: string;
    features: string[];
    color: string;
  } | null;
  onClose: () => void;
  onSuccess: (planName: string) => void;
}

type PaymentMethod = 'card' | 'bkash' | 'nagad';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ plan, onClose, onSuccess }) => {
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

  if (!plan) return null;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess(plan.name);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="max-w-4xl w-full glass-panel rounded-[3.5rem] overflow-hidden flex flex-col md:flex-row shadow-[0_50px_100px_rgba(0,0,0,0.9)] border border-white/10 animate-in zoom-in-95 duration-500">
        
        <div className="w-full md:w-80 bg-zinc-900/50 p-10 border-b md:border-b-0 md:border-r border-white/5">
          <button onClick={onClose} className="mb-10 text-zinc-600 hover:text-white transition-colors flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest">
            <i className="fa-solid fa-arrow-left"></i>
            <span>Cancel</span>
          </button>
          
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Order Summary</h3>
            <div className="pt-6 border-t border-white/5">
              <div className="text-2xl font-serif text-white mb-1">{plan.name}</div>
              <div className="flex items-baseline space-x-1 mb-6">
                <span className="text-3xl font-serif text-yellow-500 font-bold">{plan.price}</span>
                <span className="text-zinc-600 text-xs">/monthly</span>
              </div>
              <ul className="space-y-3">
                {plan.features.slice(0, 3).map((f, i) => (
                  <li key={i} className="flex items-center space-x-3 text-[10px] text-zinc-400 uppercase tracking-widest">
                    <i className="fa-solid fa-check text-yellow-500/40"></i>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-10 mt-10 border-t border-white/10">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                <span>Subtotal</span>
                <span className="text-white">{plan.price}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
                <span>VAT (Taxes)</span>
                <span className="text-white">৳০.০০</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <span className="text-xs font-black uppercase tracking-widest text-white">Total</span>
                <span className="text-xl font-serif text-yellow-500 font-bold">{plan.price}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-10 md:p-16 flex flex-col justify-center">
          <h2 className="text-3xl font-serif text-white mb-10 italic">Secure Checkout</h2>
          
          <div className="flex space-x-4 mb-10">
            <button 
              onClick={() => setMethod('card')}
              className={`flex-1 py-4 rounded-2xl border transition-all flex flex-col items-center justify-center space-y-2
                ${method === 'card' ? 'border-yellow-500 bg-yellow-500/5 text-yellow-500' : 'border-white/5 bg-black/40 text-zinc-600 hover:border-white/10'}
              `}
            >
              <i className="fa-solid fa-credit-card text-xl"></i>
              <span className="text-[9px] font-black uppercase tracking-widest">Card</span>
            </button>
            <button 
              onClick={() => setMethod('bkash')}
              className={`flex-1 py-4 rounded-2xl border transition-all flex flex-col items-center justify-center space-y-2
                ${method === 'bkash' ? 'border-[#D12053] bg-[#D12053]/5 text-[#D12053]' : 'border-white/5 bg-black/40 text-zinc-600 hover:border-white/10'}
              `}
            >
              <span className="text-xl font-bold">bKash</span>
              <span className="text-[9px] font-black uppercase tracking-widest">Mobile Pay</span>
            </button>
            <button 
              onClick={() => setMethod('nagad')}
              className={`flex-1 py-4 rounded-2xl border transition-all flex flex-col items-center justify-center space-y-2
                ${method === 'nagad' ? 'border-[#F7941D] bg-[#F7941D]/5 text-[#F7941D]' : 'border-white/5 bg-black/40 text-zinc-600 hover:border-white/10'}
              `}
            >
              <span className="text-xl font-bold">Nagad</span>
              <span className="text-[9px] font-black uppercase tracking-widest">E-Wallet</span>
            </button>
          </div>

          <form onSubmit={handlePayment} className="space-y-6">
            {method === 'card' ? (
              <>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Card Number</label>
                  <input required type="text" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))} className="w-full bg-black/60 border border-white/10 rounded-2xl py-5 px-6 text-sm font-medium text-white outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-800" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Expiry Date</label>
                    <input required type="text" placeholder="MM / YY" className="w-full bg-black/60 border border-white/10 rounded-2xl py-5 px-6 text-sm font-medium text-white outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-800" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">CVV</label>
                    <input required type="password" placeholder="***" className="w-full bg-black/60 border border-white/10 rounded-2xl py-5 px-6 text-sm font-medium text-white outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-800" />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="p-8 bg-zinc-900/80 rounded-[2rem] border border-white/5 text-center">
                  <p className="text-xs text-zinc-400 leading-relaxed italic">
                    You will be redirected to the {method === 'bkash' ? 'bKash' : 'Nagad'} secure gateway to complete the transaction via your mobile wallet.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Mobile Number</label>
                  <input required type="tel" placeholder="01XXXXXXXXX" className="w-full bg-black/60 border border-white/10 rounded-2xl py-5 px-6 text-sm font-medium text-white outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-800" />
                </div>
              </div>
            )}

            <button disabled={isProcessing} className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] transition-all relative overflow-hidden ${isProcessing ? 'bg-zinc-800 text-zinc-600 cursor-wait' : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_20px_60px_rgba(234,179,8,0.2)] active:scale-95'}`}>
              {isProcessing ? 'Authorizing Payment...' : 'Complete Payment'}
            </button>
            <p className="text-center text-[8px] text-zinc-700 uppercase font-black tracking-widest">
              <i className="fa-solid fa-lock mr-2"></i>
              256-bit encrypted secure transmission
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
