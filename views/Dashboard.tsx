
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { View } from '../types';
import { GlassCard, SectionHeader, SchoolLogo } from '../components/Common';
import { 
  Calendar, CheckCircle, Book, Clock, Activity, 
  CreditCard, Bell, MapPin, MessageCircle, Image, CalendarOff, FolderOpen, Phone, LogOut,
  Power, CheckCircle as CheckCircleIcon, FileText
} from 'lucide-react';
import { User } from 'firebase/auth';
import { logoutUser } from '../services/firebaseService';

interface Props {
  changeView: (view: View) => void;
  user: User | null;
}

const Dashboard: React.FC<Props> = ({ changeView, user }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const menuItems = [
    { label: "Attendance", icon: <CheckCircle />, color: "text-green-500", bg: "bg-green-100", view: View.ATTENDANCE },
    { label: "Homework", icon: <Book />, color: "text-royal", bg: "bg-indigo-100", view: View.HOMEWORK },
    { label: "Timetable", icon: <Clock />, color: "text-neon", bg: "bg-purple-100", view: View.TIMETABLE },
    { label: "Exam Dates", icon: <Calendar />, color: "text-orange-500", bg: "bg-orange-100", view: View.EXAM_SCHEDULE }, // Added
    { label: "Materials", icon: <FolderOpen />, color: "text-rose-500", bg: "bg-rose-100", view: View.MATERIALS },
    { label: "Results", icon: <Activity />, color: "text-pink-500", bg: "bg-pink-100", view: View.RESULTS },
    { label: "Fees", icon: <CreditCard />, color: "text-golden", bg: "bg-yellow-100", view: View.FEES },
    { label: "Apply Leave", icon: <CalendarOff />, color: "text-teal-500", bg: "bg-teal-100", view: View.LEAVE },
    { label: "Notices", icon: <Bell />, color: "text-red-500", bg: "bg-red-100", view: View.NOTICES },
    { label: "Location", icon: <MapPin />, color: "text-aqua", bg: "bg-cyan-100", view: View.LOCATION },
    { label: "Gallery", icon: <Image />, color: "text-indigo-500", bg: "bg-indigo-100", view: View.GALLERY },
    { label: "AI Help", icon: <MessageCircle />, color: "text-blue-500", bg: "bg-blue-100", view: View.CHAT },
    { label: "Contact Us", icon: <Phone />, color: "text-emerald-500", bg: "bg-emerald-100", view: View.CONTACT },
    { label: "Logout", icon: <LogOut />, color: "text-red-500", bg: "bg-red-50", view: View.AUTH },
  ];

  const handleLogout = async () => {
    // 1. Show Overlay IMMEDIATELY
    setIsLoggingOut(true);

    // 2. Play animation for 0.6 seconds BEFORE cutting session
    setTimeout(async () => {
        try {
            // 3. Perform Logout
            await logoutUser();
            // 4. Force Redirect (Backup to App.tsx listener)
            changeView(View.AUTH);
        } catch (error) {
            console.error("Logout failed", error);
            changeView(View.AUTH);
        } finally {
            setIsLoggingOut(false);
        }
    }, 600);
  };

  // Extract first name for greeting
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Student';

  // --- LOGOUT OVERLAY ---
  if (isLoggingOut) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center"
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6 relative">
                    <Power size={32} />
                    <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-2">Logging Out...</h3>
                <p className="text-gray-500 font-medium">See you soon, {firstName}!</p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full"
                >
                    <CheckCircleIcon size={18} /> Safe & Secure
                </motion.div>
            </motion.div>
        </div>
    );
  }

  return (
    <div className="pb-24 pt-8 px-6 overflow-y-auto h-full no-scrollbar">
      {/* Brand Header */}
      <div className="flex justify-between items-start mb-6">
         <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                 <SchoolLogo />
             </div>
             <div>
                <h2 className="text-lg font-black text-gray-900 leading-none">Presidency</h2>
                <p className="text-sm font-bold text-royal tracking-widest uppercase">Academy</p>
             </div>
         </div>
         <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-royal to-aqua p-[2px] cursor-pointer" onClick={() => changeView(View.PROFILE)}>
            <img 
                src={user?.photoURL || "https://picsum.photos/200"} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover border-2 border-white"
            />
        </div>
      </div>

      {/* Greeting */}
      <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900">Hi, {firstName}! 👋</h1>
          <p className="text-gray-500 font-medium">Class XII - A | Roll No. 24</p>
      </div>

      {/* Attendance Summary */}
      <GlassCard className="mb-8 relative overflow-hidden bg-gradient-to-br from-royal to-blue-700 border-none text-white">
        <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex justify-between items-center">
            <div>
                <p className="text-blue-200 font-medium mb-1">Attendance</p>
                <h3 className="text-4xl font-black">92%</h3>
                <p className="text-sm text-blue-200 mt-2">Excellent! Keep it up.</p>
            </div>
            <div className="w-20 h-20 relative">
                 <svg className="transform -rotate-90 w-full h-full">
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-blue-900/30" />
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={226} strokeDashoffset={226 - (226 * 92) / 100} className="text-aqua" />
                 </svg>
            </div>
        </div>
      </GlassCard>

      {/* Quick Menu */}
      <SectionHeader title="Dashboard" subtitle="Everything you need" />
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-4"
      >
        {menuItems.map((itemData, idx) => (
            <motion.div variants={item} key={idx}>
                <button 
                    onClick={() => {
                        if (itemData.view === View.AUTH) {
                            handleLogout();
                        } else {
                            changeView(itemData.view);
                        }
                    }}
                    className="w-full flex flex-col items-center gap-3 group"
                >
                    <div className={`w-16 h-16 rounded-2xl ${itemData.bg} ${itemData.color} flex items-center justify-center shadow-sm group-active:scale-95 transition-transform duration-200 relative`}>
                         <div className="absolute inset-0 rounded-2xl bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                         {React.cloneElement(itemData.icon, { size: 28 })}
                    </div>
                    <span className="text-xs font-bold text-gray-600">{itemData.label}</span>
                </button>
            </motion.div>
        ))}
      </motion.div>

      {/* Upcoming Homework Preview */}
      <div className="mt-8">
        <SectionHeader title="Due Soon" action={<button className="text-royal font-bold text-sm">View All</button>} />
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
             {['Physics Lab', 'Math Algebra', 'English Essay'].map((sub, i) => (
                 <GlassCard key={i} className="min-w-[200px] bg-white">
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`w-2 h-2 rounded-full ${i===0 ? 'bg-red-500' : 'bg-golden'}`} />
                        <span className="text-xs text-gray-400 font-bold uppercase">Today</span>
                    </div>
                    <h4 className="font-bold text-gray-800 text-lg mb-1">{sub}</h4>
                    <p className="text-xs text-gray-500">Ch. 4 - Force & Motion</p>
                 </GlassCard>
             ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
