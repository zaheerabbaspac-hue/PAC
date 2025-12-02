
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { View } from '../types';
import { NeonButton, FloatingInput, GlassCard, SchoolLogo } from '../components/Common';
import { ArrowRight, BookOpen, BarChart2, Users, User, Lock, Mail, ChevronRight, Loader2, Shield, UserPlus, Upload, X } from 'lucide-react';
import { loginUser, registerUser, getUserProfile, logoutUser } from '../services/firebaseService';
import { isFirebaseConfigured } from '../services/firebaseConfig';

interface Props {
  changeView: (view: View) => void;
}

// ... SplashScreen and Onboarding Components ...
export const SplashScreen: React.FC<Props> = ({ changeView }) => {
  useEffect(() => {
    const timer = setTimeout(() => changeView(View.ONBOARDING), 2000);
    return () => clearTimeout(timer);
  }, [changeView]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden bg-offwhite">
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-royal/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[20%] right-[-20%] w-[500px] h-[500px] bg-neon/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-aqua/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="z-10 flex flex-col items-center"
      >
        <div className="w-48 h-48 rounded-[2rem] bg-white/40 backdrop-blur-md border border-white/60 p-6 flex items-center justify-center shadow-2xl shadow-royal/30 mb-8 rotate-3 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-50 z-0"></div>
          <div className="w-full h-full relative z-20 transform transition-transform duration-700 hover:scale-110">
              <SchoolLogo className="w-full h-full object-contain" />
          </div>
        </div>
        <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-black text-center text-gray-900 leading-tight px-8 drop-shadow-sm">
          Presidency<br/><span className="text-royal">Academy</span>
        </motion.h1>
      </motion.div>
    </div>
  );
};

export const Onboarding: React.FC<Props> = ({ changeView }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Smart Digital Learning",
      desc: "AI Help Assistant, futuristic study materials, and instant doubt solving.",
      icon: <BookOpen className="w-32 h-32 text-white" />,
      color: "from-royal to-blue-500"
    },
    {
      title: "Real-Time Tracking",
      desc: "Visualize your academic progress with advanced analytics.",
      icon: <BarChart2 className="w-32 h-32 text-white" />,
      color: "from-neon to-purple-500"
    },
    {
      title: "Stay Connected",
      desc: "Instant updates on notices, bus tracking, and events.",
      icon: <Users className="w-32 h-32 text-white" />,
      color: "from-aqua to-cyan-500"
    }
  ];

  return (
    <div className="h-full w-full flex flex-col justify-between p-6 pt-20 relative overflow-hidden bg-offwhite">
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-royal via-transparent to-transparent" />
      </div>

      <div className="z-10 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="flex flex-col items-center text-center"
          >
            <div className={`w-[80vw] h-[40vh] rounded-[40px] bg-gradient-to-br ${steps[step].color} shadow-2xl flex items-center justify-center mb-10 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm transform rotate-45 scale-150 translate-y-1/2"></div>
                <motion.div animate={{ rotate: [0, 5, -5, 0], y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                    {steps[step].icon}
                </motion.div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">{steps[step].title}</h2>
            <p className="text-gray-500 font-medium px-4 leading-relaxed">{steps[step].desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="z-10 w-full pb-10">
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-royal' : 'w-2 bg-gray-300'}`} />
          ))}
        </div>
        
        <NeonButton 
            fullWidth 
            onClick={() => {
                if(step < steps.length - 1) setStep(step + 1);
                else changeView(View.AUTH);
            }}
        >
            {step === steps.length - 1 ? "Get Started" : "Next"} <ChevronRight size={20} />
        </NeonButton>
        <button 
            onClick={() => changeView(View.AUTH)}
            className="mt-4 text-sm font-bold text-gray-400 hover:text-royal transition-colors w-full py-2"
        >
            Skip Intro
        </button>
      </div>
    </div>
  );
};

// ... Auth Component ...
export const Auth: React.FC<Props> = ({ changeView }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'student' | 'parent' | 'teacher' | 'admin' | 'superadmin'>('student');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
    if (isLogin) {
        setRole('student');
    }
  };

  const routeUserByRole = (role: string) => {
    switch (role) {
      case 'superadmin': changeView(View.SUPER_DASHBOARD); break;
      case 'admin': changeView(View.ADMIN_DASHBOARD); break;
      case 'teacher': changeView(View.TEACHER_DASHBOARD); break;
      case 'parent': changeView(View.PARENT_DASHBOARD); break;
      case 'student':
      default: changeView(View.DASHBOARD); break;
    }
  };

  const handleAuth = async () => {
    setErrorMsg('');
    if (!formData.email || !formData.password) {
      setErrorMsg("Please enter email and password.");
      return;
    }
    setLoading(true);

    try {
        let authUser;
        if (isLogin) {
            authUser = await loginUser(formData.email, formData.password);
            
            // Check status BEFORE routing
            if (authUser) {
                const profile = await getUserProfile(authUser.uid);
                if (profile) {
                    routeUserByRole(profile.role);
                } else {
                    changeView(View.DASHBOARD);
                }
            }
        } else {
            // Basic signup
            if (!formData.name) throw new Error("Name is required");
            authUser = await registerUser(formData.email, formData.password, formData.name, role);
            if(authUser) routeUserByRole(role);
        }
    } catch (err: any) {
        // Auto-Provisioning logic for demo
        const isUserNotFound = err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential';
        if (isUserNotFound && isLogin && (formData.email.includes('admin') || formData.email.includes('teacher'))) {
             // ... existing auto-provisioning code if needed ...
        }
        
        console.error("Auth Error:", err);
        let msg = "Authentication failed.";
        if (err.message) msg = err.message.replace('Firebase: ', '');
        setErrorMsg(msg);
    } finally {
        setLoading(false);
    }
  };

  // --- MAIN AUTH SCREEN ---
  return (
    <div className="h-full w-full p-6 pt-12 relative bg-offwhite flex flex-col">
       <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-neon/20 rounded-full blur-3xl" />
       <div className="absolute bottom-[10%] left-[-10%] w-[200px] h-[200px] bg-aqua/20 rounded-full blur-3xl" />

      <div className="z-10 mb-8 flex flex-col items-center">
        <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-white rounded-2xl shadow-lg shadow-royal/20 mb-6 flex items-center justify-center p-4 relative overflow-hidden"
         >
             <SchoolLogo />
         </motion.div>

        <motion.h1 
            initial={{ y: -20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-black text-gray-900 mb-2 text-center"
        >
            {isLogin ? "Welcome Back!" : "Join Presidency"}
        </motion.h1>
      </div>

      <GlassCard className="flex-1 flex flex-col justify-center backdrop-blur-xl bg-white/60">
        
        {isLogin && (
           <div className="mb-4 text-center">
             <p className="text-xs text-gray-400 font-bold mb-2">LOGIN AS</p>
             <div className="flex flex-wrap justify-center gap-2">
               {['Student', 'Parent', 'Teacher', 'Admin', 'SuperAdmin'].map(r => (
                 <button 
                    key={r} 
                    onClick={() => setRole(r.toLowerCase() as any)}
                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${role === r.toLowerCase() ? 'bg-royal text-white border-royal' : 'bg-white text-gray-400 border-gray-200'}`}
                 >
                   {r}
                 </button>
               ))}
             </div>
           </div>
        )}

        {/* Create Account Logic */}
        {!isLogin && (
            <div className="mb-4 text-center">
               <div className="p-3 bg-blue-50 text-royal rounded-xl border border-blue-100 font-bold text-sm flex items-center justify-center gap-2">
                   <UserPlus size={16} /> Student Registration
               </div>
               <p className="text-xs text-gray-400 mt-2">Only students can self-register. Other roles must be created by Admin.</p>
            </div>
        )}

        {!isLogin && (
             <FloatingInput label="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} icon={<User size={18} />} />
        )}

        <FloatingInput label="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} icon={<Mail size={18} />} />
        <FloatingInput label="Password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} icon={<Lock size={18} />} />

        {errorMsg && (
            <div className="text-red-500 text-xs font-bold text-center mb-4 bg-red-50 p-3 rounded-xl border border-red-100">{errorMsg}</div>
        )}

        <NeonButton fullWidth onClick={handleAuth}>
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "Log In" : "Create Account")} 
            {!loading && <ArrowRight size={20} />}
        </NeonButton>

        {(!isLogin || role === 'student') && (
            <button onClick={toggleAuthMode} className="mt-6 text-sm font-bold text-gray-400 hover:text-royal transition-colors text-center w-full">
                {isLogin ? "New Student? Create Account" : "Already have an account? Log In"}
            </button>
        )}
        
        {isLogin && role !== 'student' && (
            <p className="mt-6 text-xs text-gray-300 font-medium text-center">Restricted Access • Official Credentials Required</p>
        )}

      </GlassCard>
    </div>
  );
};
