
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { LiveChat } from './components/LiveChat';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthPortal } from './components/AuthPortal';
import { DressToDummyTool } from './components/DressToDummyTool';
import { ModelTier, ProcessingState, GeneratedAsset, GenerationType, StylingPreset, User, UserAccount } from './types';
import { analyzeFashionContext, generateFashionImage, generateFashionVideo, extractDressToDummy } from './services/geminiService';

const INITIAL_MOCK_USERS: UserAccount[] = [
  { id: 'USR-001', name: 'TANVIR HOSSAIN', email: 'tanvir@creative.biz', plan: 'Studio Master', status: 'active', joinedDate: '2025-05-12', totalGenerations: 142, credits: 85 },
  { id: 'USR-002', name: 'SARAH AHMED', email: 'sarah@agency.com', plan: 'Creator', status: 'active', joinedDate: '2025-06-01', totalGenerations: 45, credits: 120 },
  { id: 'USR-003', name: 'KARIM ULLAH', email: 'karim@style.it', plan: 'Enterprise', status: 'active', joinedDate: '2025-04-20', totalGenerations: 890, credits: 1540 },
  { id: 'USR-004', name: 'NUSRAT JAHAN', email: 'nusrat@fashion.co', plan: 'Free', status: 'suspended', joinedDate: '2025-06-10', totalGenerations: 5, credits: 0 },
  { id: 'USR-005', name: 'ARIF RAHMAN', email: 'arif@biz.com', plan: 'Studio Master', status: 'active', joinedDate: '2025-06-15', totalGenerations: 67, credits: 45 },
];

const App: React.FC = () => {
  const [refImage, setRefImage] = useState<string | null>(null);
  const [prodImage, setProdImage] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [preset, setPreset] = useState<StylingPreset>(StylingPreset.WEARING);
  const [brandContext, setBrandContext] = useState<string>('Luxury Couture');
  const [results, setResults] = useState<GeneratedAsset[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [genType, setGenType] = useState<GenerationType>(GenerationType.IMAGE);
  const [tier, setTier] = useState<ModelTier>(ModelTier.IMAGE_GEN);
  const [studioTool, setStudioTool] = useState<'synthesis' | 'dummy-extractor'>('synthesis');
  
  // User Management
  const [allUsers, setAllUsers] = useState<UserAccount[]>(INITIAL_MOCK_USERS);
  
  const [processingState, setProcessingState] = useState<ProcessingState>({
    stage: 'idle',
    progress: 0,
    message: ''
  });

  // Navigation & Auth State
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [isAuthPortalOpen, setIsAuthPortalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Checkout State
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activePlan, setActivePlan] = useState<string>('Free');

  // Slider Ref
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleUpdateCredits = (email: string, amount: number) => {
    setAllUsers(prev => prev.map(u => u.email === email ? { ...u, credits: u.credits + amount } : u));
    if (currentUser && currentUser.email === email) {
      setCurrentUser(prev => prev ? ({ ...prev, credits: prev.credits + amount }) : null);
    }
  };

  const handleDummyExtraction = async (image: string, style: string) => {
    if (!currentUser || currentUser.credits < 5) {
      alert("Insufficient credits. Each generation costs 5 credits.");
      return;
    }

    // Pro model requires user selected API key
    if (typeof window.aistudio?.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }

    setIsProcessing(true);
    setResults([]);
    try {
      setProcessingState({
        stage: 'analysis',
        progress: 30,
        message: 'Studio Agent: Initiating Hyper-Precision Garment Lockdown...'
      });

      const url = await extractDressToDummy(image, style);
      
      setResults([{
        id: `DUMMY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        url,
        type: 'image',
        timestamp: Date.now()
      }]);

      const cost = 5;
      setCurrentUser(prev => prev ? ({ ...prev, credits: Math.max(0, prev.credits - cost) }) : null);
      setAllUsers(prev => prev.map(u => u.email === currentUser.email ? { ...u, credits: Math.max(0, u.credits - cost) } : u));

      setProcessingState({ stage: 'completed', progress: 100, message: 'Garment Isolated with 100% Fidelity.' });
    } catch (error: any) {
      console.error('Dummy Extraction Error:', error);
      if (error.message?.includes("Requested entity was not found")) {
        if (typeof window.aistudio?.openSelectKey === 'function') {
           await window.aistudio.openSelectKey();
        }
      }
      setProcessingState({ stage: 'failed', progress: 0, message: error.message || 'Extraction Interrupted.' });
    } finally {
      setTimeout(() => setIsProcessing(false), 2000);
    }
  };

  const handleGenerate = async () => {
    if (!currentUser) {
      setIsAuthPortalOpen(true);
      return;
    }
    
    if (currentUser.credits < 5) {
      alert("Insufficient credits. Each generation costs 5 credits.");
      return;
    }

    if (!refImage || !prodImage) return;

    if (genType === GenerationType.VIDEO || tier === ModelTier.IMAGE_PRO) {
      if (typeof window.aistudio?.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      }
    }

    setIsProcessing(true);
    setResults([]);
    
    try {
      setProcessingState({
        stage: 'analysis',
        progress: 15,
        message: 'Studio Agent: Extracting Essence & Identity...'
      });

      const analysis = await analyzeFashionContext(refImage, prodImage, bgImage, preset, brandContext);

      if (genType === GenerationType.IMAGE) {
        const url = await generateFashionImage(analysis, refImage, prodImage, tier);
        
        setResults([{
          id: `CREATIVE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          url,
          type: 'image',
          promptData: analysis,
          timestamp: Date.now()
        }]);

        const cost = 5;
        setCurrentUser(prev => prev ? ({ ...prev, credits: Math.max(0, prev.credits - cost) }) : null);
        setAllUsers(prev => prev.map(u => u.email === currentUser.email ? { ...u, credits: Math.max(0, u.credits - cost) } : u));

      } else {
        setProcessingState({
          stage: 'rendering',
          progress: 10,
          message: 'Initiating FashionClone Neural Video Synthesis (May take 1-2 minutes)...'
        });

        const videoUrl = await generateFashionVideo(analysis, refImage, (msg) => {
          setProcessingState(prev => ({ 
            ...prev, 
            message: msg,
            progress: Math.min(prev.progress + 5, 95)
          }));
        });

        setResults([{
          id: `CREATIVE-VEO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          url: videoUrl,
          type: 'video',
          promptData: analysis,
          timestamp: Date.now()
        }]);

        const cost = 5;
        setCurrentUser(prev => prev ? ({ ...prev, credits: Math.max(0, prev.credits - cost) }) : null);
        setAllUsers(prev => prev.map(u => u.email === currentUser.email ? { ...u, credits: Math.max(0, u.credits - cost) } : u));
      }

      setProcessingState({ stage: 'completed', progress: 100, message: 'Identity Integrity Verified. Production Ready.' });
    } catch (error: any) {
      console.error('Generation Error:', error);
      if (error.message?.includes("Requested entity was not found")) {
        if (typeof window.aistudio?.openSelectKey === 'function') {
           await window.aistudio.openSelectKey();
        }
      }
      setProcessingState({ 
        stage: 'failed', 
        progress: 0, 
        message: error.message || 'Studio Interruption.' 
      });
    } finally {
      setTimeout(() => setIsProcessing(false), 2000);
    }
  };

  const resetWorkspace = useCallback(() => {
    setRefImage(null);
    setProdImage(null);
    setBgImage(null);
    setResults([]);
    setProcessingState({ stage: 'idle', progress: 0, message: '' });
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCheckoutSuccess = (planName: string) => {
    setActivePlan(planName);
    setIsCheckoutOpen(false);
  };

  const handleLoginSuccess = (user: User) => {
    // Check if user exists in mock DB
    const existing = allUsers.find(u => u.email === user.email);
    if (existing) {
      setCurrentUser({ ...user, credits: existing.credits });
    } else {
      setCurrentUser(user);
      setAllUsers(prev => [...prev, {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
        totalGenerations: 0,
        credits: user.credits
      }]);
    }
    setIsAuthPortalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setResults([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestAccess = () => {
    window.open('https://wa.me/8801993247534', '_blank');
  };

  const plans = [
    {
      name: 'CREATOR STUDIO',
      price: '৳১,৫০০',
      features: ['৫০টি AI জেনারেশন / মাস', 'স্ট্যান্ডার্ড কোয়ালিটি আউটপুট', 'বেসিক আইডেন্টিটি লক', 'কমিউনিটি সাপোর্ট', 'সিঙ্গেল ইউজার অ্যাক্সেস'],
      color: 'zinc'
    },
    {
      name: 'PROFESSIONAL MASTER',
      price: '৳৩,৫০০',
      features: ['আনলিমিটেড AI জেনারেশন', 'আল্ট্রা-হাই রেজোলিউশন ৪কে আউটপুট', 'অ্যাডভান্সড নিউরাল আইডেন্টিটি লক', 'প্রায়োরিটি রেন্ডারিং কিউ', 'ভিডিও সিন্থেসিস অ্যাক্সেস'],
      color: 'yellow',
      isPopular: true
    },
    {
      name: 'ENTERPRISE AGENCY',
      price: '৳৫,৫০০',
      features: ['ডেডিকেটেড স্টুডিও সাপোর্ট', 'কাস্টম আইডেন্টিটি TRAINING', 'ফুল API অ্যাক্সেস', 'মাল্টিপল টিম ওয়ার্কস্পেস', 'হোয়াইট-লেবেল কন্টেন্ট আউটপুট'],
      color: 'zinc'
    }
  ];

  return (
    <div className="min-h-screen pb-40 bg-[#050505] text-zinc-300 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[60] h-24 flex items-center justify-between px-12 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 flex items-center justify-center text-yellow-500 border border-yellow-500/20 rounded-full">
            <i className="fa-solid fa-sparkles text-sm"></i>
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">Creative Biz</span>
        </div>

        <div className="hidden md:flex items-center space-x-12 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
          <button onClick={() => scrollToSection('tool-collection')} className="hover:text-white transition-colors">Features</button>
          <button onClick={() => scrollToSection('subscription-plans')} className="hover:text-white transition-colors">Pricing</button>
          <button onClick={() => {
            if (currentUser) scrollToSection('studio-core');
            else setIsAuthPortalOpen(true);
          }} className="hover:text-white transition-colors">Studio</button>
          
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/10 rounded-full border border-yellow-500/20 group">
                  <i className="fa-solid fa-gem text-[10px] text-yellow-500 group-hover:animate-bounce"></i>
                  <span className="text-[10px] font-black text-white">{currentUser.credits} Credits</span>
                </div>

                <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                  <span className="text-[9px] font-black text-zinc-600">PLAN:</span>
                  <span className="text-[9px] font-black text-yellow-500 uppercase">{activePlan}</span>
                </div>
                
                <div className="relative group">
                  <div className="flex items-center space-x-3 cursor-pointer">
                    <div className="text-right">
                      <div className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{currentUser.name}</div>
                      <div className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">{currentUser.isAdmin ? 'System Admin' : 'Active Member'}</div>
                    </div>
                    {currentUser.photoURL ? (
                      <div className="w-10 h-10 rounded-full border border-yellow-500/20 p-0.5 overflow-hidden transition-all group-hover:border-yellow-500">
                        <img src={currentUser.photoURL} className="w-full h-full rounded-full object-cover" alt="Profile" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-yellow-500/20 text-yellow-500 text-xs font-black group-hover:border-yellow-500 transition-all">
                        {currentUser.name.charAt(0)}
                      </div>
                    )}
                    <i className="fa-solid fa-chevron-down text-[8px] text-zinc-600 group-hover:text-white transition-all"></i>
                  </div>

                  <div className="absolute right-0 top-full pt-4 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
                    <div className="w-48 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl">
                      <button className="w-full flex items-center space-x-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <i className="fa-solid fa-user-gear"></i>
                        <span>Settings</span>
                      </button>
                      {currentUser.isAdmin && (
                        <button 
                          onClick={() => setIsAdminPortalOpen(true)}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-yellow-500 hover:bg-yellow-500/5 rounded-xl transition-all"
                        >
                          <i className="fa-solid fa-shield-halved"></i>
                          <span>Admin Hub</span>
                        </button>
                      )}
                      <div className="h-[1px] bg-white/5 my-2 mx-2"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <i className="fa-solid fa-right-from-bracket"></i>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthPortalOpen(true)}
                className="px-8 py-3 bg-yellow-500 text-black rounded-xl font-bold tracking-widest uppercase text-[10px] hover:bg-yellow-400 transition-all flex items-center space-x-2"
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-24 text-center px-6">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-10">
          <i className="fa-solid fa-sparkles text-[8px]"></i>
          <span>Creative Biz Platform</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-serif text-white max-w-4xl mx-auto leading-[1.1] mb-10">
          Your Personal AI Studio for <span className="text-yellow-500 italic">Beauty,</span><br />
          <span className="text-yellow-500">Fashion & Content Creation</span>
        </h1>
        
        <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
          One platform. Multiple professional AI studios — built for makeup artists,
          creators, and modern brands by Creative Biz.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button 
            onClick={() => {
              if (currentUser) scrollToSection('studio-core');
              else setIsAuthPortalOpen(true);
            }}
            className="w-full sm:w-auto px-10 py-5 bg-yellow-500 text-black rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 hover:bg-yellow-400 transition-all active:scale-95 shadow-[0_10px_40px_rgba(234,179,8,0.2)]"
          >
            <span>{currentUser ? 'Enter Studio' : 'Get Started'}</span>
            <i className="fa-solid fa-arrow-right text-sm"></i>
          </button>
          <button 
            onClick={handleRequestAccess}
            className="w-full sm:w-auto px-10 py-5 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 hover:bg-zinc-800 transition-all"
          >
            <i className="fa-solid fa-comment-dots"></i>
            <span>Request Access</span>
          </button>
        </div>
      </section>

      {currentUser ? (
        <main id="studio-core" className="max-w-[1400px] mx-auto px-8 mt-24 animate-in slide-in-from-bottom-12 duration-1000">
          <div className="flex flex-col items-center mb-16">
            <div className="px-6 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 text-[9px] font-black uppercase tracking-[0.5em] mb-8">
              Studio Engine
            </div>
            <h2 className="text-4xl font-serif text-white">Creative Biz Agent Core</h2>
            
            <div className="mt-8 flex bg-zinc-900 p-1 rounded-2xl border border-white/5 w-fit">
              <button 
                onClick={() => setStudioTool('synthesis')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${studioTool === 'synthesis' ? 'bg-yellow-500 text-black' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                Fashion Synthesis
              </button>
              <button 
                onClick={() => setStudioTool('dummy-extractor')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${studioTool === 'dummy-extractor' ? 'bg-yellow-500 text-black' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                Dress-to-Dummy Extractor
              </button>
            </div>
          </div>

          {studioTool === 'synthesis' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <aside className="lg:col-span-4 space-y-12">
                <div className="glass-panel rounded-[2.5rem] p-8 space-y-10">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Asset Ingestion</h3>
                    <i className="fa-solid fa-microchip text-yellow-500/40"></i>
                  </div>
                  <div className="space-y-8">
                    <ImageUploader label="Character Ref" description="Body proportion & identity lock" icon="fa-id-card" image={refImage} onUpload={setRefImage} />
                    <ImageUploader label="Product Garment" description="Fabric & pattern authority" icon="fa-vest" image={prodImage} onUpload={setProdImage} />
                    <ImageUploader label="Background" description="Optional Scene Image" icon="fa-image" image={bgImage} onUpload={setBgImage} />
                  </div>
                </div>

                <div className="glass-panel rounded-[2.5rem] p-8 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Styling Preset</label>
                      <select 
                        value={preset} 
                        onChange={(e) => setPreset(e.target.value as StylingPreset)}
                        className="w-full bg-black border border-white/10 rounded-2xl py-5 px-6 text-xs font-bold uppercase tracking-widest text-white outline-none focus:border-yellow-500 transition-colors appearance-none"
                      >
                        {Object.values(StylingPreset).map(p => (
                          <option key={p} value={p}>{p.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Brand Context</label>
                      <input 
                        type="text"
                        value={brandContext}
                        onChange={(e) => setBrandContext(e.target.value)}
                        placeholder="Luxury, Minimal, etc."
                        className="w-full bg-black border border-white/10 rounded-2xl py-5 px-6 text-xs font-bold uppercase tracking-widest text-white outline-none focus:border-yellow-500 transition-colors"
                      />
                    </div>
                    <div className="flex bg-black p-1.5 rounded-2xl border border-white/5">
                      <button onClick={() => setGenType(GenerationType.IMAGE)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${genType === GenerationType.IMAGE ? 'bg-yellow-500 text-black' : 'text-zinc-600'}`}>Image</button>
                      <button onClick={() => setGenType(GenerationType.VIDEO)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${genType === GenerationType.VIDEO ? 'bg-yellow-500 text-black' : 'text-zinc-600'}`}>Video</button>
                    </div>
                  </div>
                  <div className="pt-6">
                    <button 
                      disabled={!refImage || !prodImage || isProcessing}
                      onClick={handleGenerate}
                      className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-xs transition-all
                        ${!refImage || !prodImage || isProcessing 
                          ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5' 
                          : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_20px_60px_rgba(234,179,8,0.2)] active:scale-95'
                        }
                      `}
                    >
                      {isProcessing ? 'STUDIO PROCESSING...' : `GENERATE (5 CREDITS)`}
                    </button>
                  </div>
                </div>
              </aside>

              <section className="lg:col-span-8">
                <div className="flex items-center justify-between mb-12 pb-4 border-b border-white/5">
                  <h2 className="text-xs font-black uppercase tracking-[0.6em] text-zinc-500">Studio Output Preview</h2>
                  {results.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{results.length} MASTER ASSETS</span>
                      <button onClick={resetWorkspace} className="text-[10px] text-red-500/50 hover:text-red-500 transition-colors uppercase font-bold tracking-widest">Clear All</button>
                    </div>
                  )}
                </div>

                {results.length === 0 && !isProcessing ? (
                  <div className="h-[900px] flex flex-col items-center justify-center text-center glass-panel rounded-[4rem] p-20 shadow-inner group">
                    <div className="relative mb-14">
                      <div className="w-48 h-48 rounded-full border border-zinc-900 flex items-center justify-center rotate-45 group-hover:border-yellow-500/20 transition-all duration-1000">
                        <i className="fa-solid fa-plus text-5xl text-zinc-900 -rotate-45 group-hover:text-yellow-500 transition-all duration-1000"></i>
                      </div>
                    </div>
                    <h3 className="text-3xl font-serif italic mb-6 text-zinc-400">Awaiting Ingestion</h3>
                    <p className="text-zinc-600 text-xs uppercase tracking-[0.4em] font-black max-w-sm leading-relaxed">
                      Upload character and product assets to begin the studio synthesis protocol in Creative Biz.
                    </p>
                  </div>
                ) : (
                  <div className={`grid gap-12 ${genType === GenerationType.VIDEO ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                    {results.map((asset) => (
                      <div key={asset.id} className="group relative overflow-hidden rounded-[3.5rem] border border-white/10 bg-black shadow-2xl transition-all hover:border-yellow-500/30">
                        {asset.type === 'image' ? (
                          <img src={asset.url} alt="Masterpiece" className="w-full aspect-[3/4] object-cover transition-all duration-[4s] group-hover:scale-105" />
                        ) : (
                          <div className="relative">
                            <video src={asset.url} controls autoPlay loop className="w-full aspect-video object-cover" />
                            <div className="absolute top-8 right-8 bg-yellow-500 px-5 py-2 rounded-full text-[10px] font-black text-black uppercase tracking-widest shadow-xl">STUDIO MASTER</div>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black via-black/95 to-transparent opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-500">
                          <div className="flex items-center justify-between mb-8">
                            <div>
                                <div className="text-[14px] font-bold text-white tracking-widest uppercase mb-1">{asset.id}</div>
                                <div className="text-[10px] font-mono text-zinc-500 uppercase">Integrity: 100% STUDIO VALID</div>
                            </div>
                            <button onClick={() => {
                                const a = document.createElement('a');
                                a.href = asset.url; a.download = `${asset.id}.mp4`; a.click();
                            }} className="bg-white text-black h-16 w-16 rounded-[1.5rem] flex items-center justify-center hover:bg-yellow-500 transition-all shadow-xl">
                              <i className="fa-solid fa-download text-xl"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               <div className="lg:col-span-12">
                  <DressToDummyTool onGenerate={handleDummyExtraction} isProcessing={isProcessing} />
                  {results.length > 0 && (
                    <div className="mt-20 max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-700">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                         <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Extraction Result</h3>
                         <button onClick={() => setResults([])} className="text-xs font-black text-red-500/40 hover:text-red-500 transition-colors uppercase">Clear</button>
                      </div>
                      <div className="relative group overflow-hidden rounded-[3rem] border border-white/10 bg-black shadow-2xl">
                         <img src={results[0].url} className="w-full aspect-[3/4] object-cover transition-all duration-[3s] group-hover:scale-105" alt="Dummy Result" />
                         <div className="absolute bottom-10 right-10">
                           <button onClick={() => {
                              const a = document.createElement('a');
                              a.href = results[0].url; a.download = `dummy-${results[0].id}.png`; a.click();
                           }} className="bg-white text-black h-16 w-16 rounded-[1.5rem] flex items-center justify-center hover:bg-yellow-500 transition-all shadow-xl">
                             <i className="fa-solid fa-download text-xl"></i>
                           </button>
                         </div>
                      </div>
                    </div>
                  )}
               </div>
            </div>
          )}
        </main>
      ) : (
        <section className="max-w-[1400px] mx-auto px-8 py-32 mt-24 text-center border-t border-white/5">
          <div className="glass-panel max-w-2xl mx-auto rounded-[3rem] p-20 space-y-10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-100 group-hover:backdrop-blur-none transition-all duration-700 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mb-10">
                <i className="fa-solid fa-lock text-yellow-500 text-3xl"></i>
              </div>
              <h2 className="text-3xl font-serif text-white mb-6">Agent Core Locked</h2>
              <p className="text-zinc-500 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
                Authentication is required to access Creative Biz Studio's neural synthesis engines and character-consistency tools.
              </p>
              <button 
                onClick={() => setIsAuthPortalOpen(true)}
                className="px-12 py-5 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all shadow-[0_20px_50px_rgba(234,179,8,0.2)] active:scale-95"
              >
                Sign In to Unlock Workspace
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Subscription Slider Section */}
      <section id="subscription-plans" className="max-w-[1400px] mx-auto px-8 py-32 border-t border-white/5">
        <div className="flex flex-col items-center mb-20 text-center">
          <div className="px-6 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-500 text-[9px] font-black uppercase tracking-[0.5em] mb-8">
            Pricing & Membership
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">
            Elevate Your <span className="text-yellow-500 italic">Creative Workflow</span>
          </h2>
          <p className="mt-8 text-zinc-500 text-lg max-w-xl mx-auto leading-relaxed">
            Choose the professional plan that best aligns with your production requirements.
          </p>
        </div>

        <div className="relative group/slider">
          <div 
            ref={sliderRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-12 pt-4 px-4 md:px-0 gap-8 md:grid md:grid-cols-3 md:gap-8 max-w-7xl mx-auto"
          >
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={`snap-center shrink-0 w-[85vw] md:w-auto glass-panel p-10 rounded-[3rem] border flex flex-col transition-all duration-700 relative overflow-hidden group/card
                  ${plan.isPopular ? 'border-yellow-500/30 bg-gradient-to-b from-yellow-500/[0.03] to-transparent shadow-[0_0_80px_rgba(234,179,8,0.08)] transform md:scale-105 z-10' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.01]'}
                `}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 px-8 py-3 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-bl-[2rem] shadow-xl">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-10">
                  <h3 className={`text-[11px] font-black uppercase tracking-[0.4em] mb-4 ${plan.isPopular ? 'text-yellow-500' : 'text-zinc-500'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-6xl font-bold text-white tracking-tighter">
                      {plan.price.split('৳')[1]}
                    </span>
                    <div className="flex flex-col items-start -space-y-1">
                      <span className="text-2xl font-black text-white ml-2">৳</span>
                      <span className="text-zinc-600 text-[10px] uppercase font-black ml-2 tracking-widest">/মাস</span>
                    </div>
                  </div>
                </div>

                <ul className="flex-1 space-y-6 mb-12">
                  {plan.features.map((feature, i) => (
                    <li key={i} className={`flex items-start space-x-4 text-sm leading-relaxed ${plan.isPopular ? 'text-zinc-200' : 'text-zinc-400'}`}>
                      <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border ${plan.isPopular ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500' : 'border-zinc-800 text-zinc-600'}`}>
                        <i className="fa-solid fa-check text-[10px]"></i>
                      </div>
                      <span className="font-medium tracking-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => {
                    if (!currentUser) {
                      setIsAuthPortalOpen(true);
                      return;
                    }
                    setSelectedPlan(plan);
                    setIsCheckoutOpen(true);
                  }}
                  className={`w-full py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 active:scale-95
                    ${plan.isPopular 
                      ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_20px_50px_rgba(234,179,8,0.25)]' 
                      : 'bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700'}
                  `}
                >
                  CHOOSE {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-40 pt-20 pb-12 border-t border-white/5 text-center">
        <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-12 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700">
           <a href="#" className="hover:text-zinc-500 transition-colors">Privacy</a>
           <a href="#" className="hover:text-zinc-500 transition-colors">Terms</a>
           <a href="#" className="hover:text-zinc-500 transition-colors">Support</a>
           <button onClick={() => { if (currentUser) setIsAdminPortalOpen(true); else setIsAuthPortalOpen(true); }} className="px-4 py-2 border border-zinc-800 rounded-lg hover:bg-white/5 hover:text-yellow-500 transition-all">Admin Portal</button>
           {currentUser && <button onClick={handleLogout} className="px-4 py-2 border border-red-900/30 text-red-500/50 rounded-lg hover:bg-red-500/5 hover:text-red-500 transition-all">Sign Out</button>}
        </div>
        <p className="mt-12 text-[10px] text-zinc-800 font-mono uppercase tracking-widest">&copy; 2026 Creative Biz Systems. All Identity Locks Secured.</p>
      </footer>

      {isProcessing && <ProcessingOverlay state={processingState} />}
      {isCheckoutOpen && <CheckoutModal plan={selectedPlan} onClose={() => setIsCheckoutOpen(false)} onSuccess={handleCheckoutSuccess} />}
      {isAdminPortalOpen && <AdminDashboard users={allUsers} onClose={() => setIsAdminPortalOpen(false)} onUpdateCredits={handleUpdateCredits} />}
      {isAuthPortalOpen && <AuthPortal onLogin={handleLoginSuccess} onClose={() => setIsAuthPortalOpen(false)} />}
      <LiveChat />
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
