
import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { subscribeToSchoolLogo } from '../services/firebaseService';

export const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}> = ({ children, className = '', delay = 0, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
    whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(58, 76, 255, 0.2)" }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`glass-panel rounded-3xl p-5 shadow-xl shadow-royal/10 ${className}`}
  >
    {children}
  </motion.div>
);

export const NeonButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'warning';
  className?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}> = ({ children, onClick, variant = 'primary', className = '', fullWidth = false, icon }) => {
  const getGradient = () => {
    switch (variant) {
      case 'primary': return 'from-royal to-neon shadow-royal/40';
      case 'secondary': return 'from-neon to-pink-500 shadow-neon/40';
      case 'accent': return 'from-aqua to-blue-500 shadow-aqua/40 text-blue-900';
      case 'warning': return 'from-golden to-orange-500 shadow-golden/40 text-red-900';
      default: return 'from-royal to-neon';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl py-4 px-8 font-bold text-white tracking-wide
        bg-gradient-to-r shadow-lg ${getGradient()} ${fullWidth ? 'w-full' : ''} ${className}
      `}
    >
      <div className="absolute inset-0 bg-white/20 blur-md opacity-0 hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon}
        {children}
      </span>
    </motion.button>
  );
};

export const FloatingInput: React.FC<{
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
}> = ({ label, type = 'text', value, onChange, icon }) => (
  <div className="relative group mb-6">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-royal/50 group-focus-within:text-royal transition-colors">
      {icon}
    </div>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="block w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 border border-white shadow-inner focus:outline-none focus:ring-2 focus:ring-royal/50 focus:bg-white/80 transition-all text-gray-800 placeholder-transparent peer"
      placeholder={label}
    />
    <label className="absolute left-12 -top-2.5 text-xs font-bold text-royal bg-white/80 px-2 rounded-full transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-royal">
      {label}
    </label>
  </div>
);

export const SectionHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
  <div className="flex justify-between items-end mb-6">
    <div>
      <h2 className="text-2xl font-black text-gray-800 tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 font-medium mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const SchoolLogo: React.FC<{ className?: string, useWhite?: boolean }> = ({ className = "w-full h-full", useWhite = false }) => {
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const unsub = subscribeToSchoolLogo((url) => {
      setLogoUrl(url);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Reliable SVG Fallback (Shield Icon)
  const fallbackUrl = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjM0E0Q0ZGIiBkPSJNMjU2IDBsLTI1NiAxMTJ2MjI0YzAgODYgNTcgMTYzIDEzNiAxOTZsMTIwIDUxbDEyMC01MWM3OS0zMyAxMzYtMTEwIDEzNi0xOTZ2LTIyNHoiLz48cGF0aCBmaWxsPSIjRjRGN0ZGIiBkPSJNMjU2IDQ0OGMtNTkgMjUtMTAyLTgzLTEwMi0xNDhzNDMtMTE4IDEwMi0xMThzMTAyIDUzIDEwMiAxMThzLTQzIDE3My0xMDIgMTQ4eiIvPjxwYXRoIGZpbGw9IiMzQTQ1RkYiIGQ9Ik0yNTYgMTkybC02NCA2NGw2NCA2NGw2NC02NHoiLz48L3N2Zz4=";
  
  const currentSrc = logoUrl || fallbackUrl;

  return (
    <img 
      src={currentSrc}
      alt="School Logo" 
      style={useWhite ? { filter: 'brightness(0) invert(1)' } : {}}
      className={`object-contain drop-shadow-xl ${className} ${loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
      onError={(e) => {
        // Double safety: if even the DB URL fails, revert to the data URI
        e.currentTarget.src = fallbackUrl;
      }}
    />
  );
};
