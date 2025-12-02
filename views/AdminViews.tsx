
import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { GlassCard, NeonButton, FloatingInput, SchoolLogo, SectionHeader } from '../components/Common';
import { 
  Users, UserCheck, Calendar, Clock, Activity, CreditCard, 
  Bell, Image, MessageCircle, Settings, ChevronLeft, LogOut,
  Search, CheckCircle, XCircle, Plus, Edit2, Trash2, 
  Download, Upload, CheckSquare, Square, Mic, ShieldAlert,
  UserPlus, FileText, BarChart2, Loader2, Power, FileSpreadsheet
} from 'lucide-react';
import { 
    subscribeToCollection, createSystemUser, deleteUserRecord, logoutUser, 
    subscribeToClasses, formatClassOptions
} from '../services/firebaseService';

interface Props {
  view: View;
  changeView: (view: View) => void;
}

const AdminViews: React.FC<Props> = ({ view, changeView }) => {

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [classOptions, setClassOptions] = useState<any[]>([]);

  useEffect(() => {
     const unsubClasses = subscribeToClasses((data) => {
         setClassOptions(formatClassOptions(data));
     });
     return () => { unsubClasses(); };
  }, []);

  // Handlers
  const handleLogout = async () => {
      setIsLoggingOut(true);
      setTimeout(async () => {
          try { await logoutUser(); changeView(View.AUTH); } 
          catch (e) { changeView(View.AUTH); } 
          finally { setIsLoggingOut(false); }
      }, 600);
  };

  const handleMenuClick = (v: View) => {
      if(v === View.AUTH) handleLogout();
      else changeView(v);
  }

  const header = (title: string, back = false) => (
      <div className="flex items-center gap-4 mb-6">
          {back && <button onClick={() => changeView(View.ADMIN_DASHBOARD)} className="p-2 bg-white rounded-full shadow-sm"><ChevronLeft/></button>}
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
  );

  if (isLoggingOut) {
      return (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-lg">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold text-gray-800">Logging Out...</p>
          </div>
      )
  }

  // --- DASHBOARD ---
  if (view === View.ADMIN_DASHBOARD) {
      const menu = [
          { l: "Attendance", i: <CheckCircle />, v: View.ADMIN_ATTENDANCE, c: "bg-green-500 text-white" },
          { l: "Leaves", i: <Calendar />, v: View.ADMIN_LEAVES, c: "bg-teal-500 text-white" },
          { l: "Teachers", i: <UserCheck />, v: View.ADMIN_TEACHERS, c: "bg-royal text-white" },
          { l: "Students", i: <Users />, v: View.ADMIN_STUDENTS, c: "bg-neon text-white" },
          { l: "Timetable", i: <Clock />, v: View.ADMIN_TIMETABLE, c: "bg-purple-500 text-white" },
          { l: "Results", i: <Activity />, v: View.ADMIN_RESULTS, c: "bg-pink-500 text-white" },
          { l: "Fees", i: <CreditCard />, v: View.ADMIN_FEES, c: "bg-yellow-500 text-white" },
          { l: "Notices", i: <Bell />, v: View.ADMIN_NOTICES, c: "bg-red-500 text-white" },
          { l: "Gallery", i: <Image />, v: View.ADMIN_GALLERY, c: "bg-indigo-500 text-white" },
          { l: "Chat Monitor", i: <MessageCircle />, v: View.ADMIN_CHAT, c: "bg-blue-500 text-white" },
          { l: "Profile", i: <Settings />, v: View.ADMIN_PROFILE, c: "bg-gray-800 text-white" },
          { l: "Logout", i: <LogOut />, v: View.AUTH, c: "bg-red-600 text-white" },
      ];

      return (
          <div className="p-6 h-full overflow-y-auto pb-12 bg-offwhite">
              <div className="flex justify-between items-center mb-8 pt-4">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                          <SchoolLogo />
                      </div>
                      <div>
                          <h1 className="text-xl font-black text-gray-900 leading-none">Principal's Desk</h1>
                          <p className="text-sm font-bold text-royal mt-1">Admin Control</p>
                      </div>
                  </div>
              </div>

              <SectionHeader title="Administration" subtitle="Quick Access" />
              <div className="grid grid-cols-3 gap-3 pb-8">
                  {menu.map((m, i) => (
                      <button
                          key={i}
                          onClick={() => handleMenuClick(m.v)}
                          className={`p-3 rounded-2xl shadow-md flex flex-col items-center justify-center gap-2 aspect-square ${m.c}`}
                      >
                          {React.cloneElement(m.i as any, { size: 24 })}
                          <span className="font-bold text-[10px] text-center">{m.l}</span>
                      </button>
                  ))}
              </div>
          </div>
      );
  }
  
  // Placeholder for other admin views
  if (view === View.ADMIN_ATTENDANCE) return <div className="p-6">{header("Attendance", true)}<p>Attendance Module</p></div>;
  if (view === View.ADMIN_TEACHERS) return <div className="p-6">{header("Manage Teachers", true)}<p>Teacher Module</p></div>;
  if (view === View.ADMIN_STUDENTS) return <div className="p-6">{header("Manage Students", true)}<p>Student Module</p></div>;
  
  return null;
};
export default AdminViews;
