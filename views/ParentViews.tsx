
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { View, ChatMessage } from '../types';
import { GlassCard, NeonButton, FloatingInput, SchoolLogo, SectionHeader } from '../components/Common';
import { 
  User, CheckCircle, Book, Calendar, Activity, CreditCard, Bell, Image, 
  MapPin, MessageCircle, LogOut, ChevronLeft, Download, UploadCloud, 
  Send, Mic, Phone, Power, CheckCircle as CheckCircleIcon, Bus, Clock, FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { logoutUser } from '../services/firebaseService';
import { User as FirebaseUser } from 'firebase/auth';

interface Props {
  view: View;
  changeView: (view: View) => void;
  user: FirebaseUser | null;
}

const ParentViews: React.FC<Props> = ({ view, changeView, user }) => {

  // --- MOCK DATA FOR CHILD ---
  // In a real app, this would be fetched based on the linked student ID
  const childInfo = {
    name: "Aarav Sharma",
    class: "XII - A",
    rollNo: "24",
    photo: "https://picsum.photos/200",
    attendance: 92
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
      { id: '1', text: "Hello! I am Mr. Verma, Aarav's Class Teacher. How can I help you?", sender: 'other', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- HANDLERS ---
  const handleLogout = async () => {
      // 1. Show UI
      setIsLoggingOut(true);
      
      // 2. Wait
      setTimeout(async () => {
          try {
              // 3. Perform
              await logoutUser();
              // 4. Force Redirect
              changeView(View.AUTH);
          } catch (error) {
              console.error("Logout error", error);
              changeView(View.AUTH);
          } finally {
              setIsLoggingOut(false);
          }
      }, 600);
  };

  const handleSendMessage = () => {
      if(!inputText.trim()) return;
      setMessages([...messages, { id: Date.now().toString(), text: inputText, sender: 'user', timestamp: new Date() }]);
      setInputText("");
      setTimeout(() => {
           setMessages(prev => [...prev, { id: Date.now().toString(), text: "Thank you for reaching out. I will get back to you shortly.", sender: 'other', timestamp: new Date() }]);
      }, 1000);
  };

  const header = (title: string, back = true) => (
    <div className="flex items-center justify-between mb-6 pt-4 sticky top-0 bg-offwhite/90 backdrop-blur-md py-4 z-20">
      <div className="flex items-center gap-4">
        {back && (
          <button onClick={() => changeView(View.PARENT_DASHBOARD)} className="p-2 rounded-full bg-white shadow-md text-gray-700 active:scale-90 transition-transform">
            <ChevronLeft />
          </button>
        )}
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">{title}</h2>
      </div>
    </div>
  );

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
                  <p className="text-gray-500 font-medium">Have a great day!</p>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full"
                  >
                      <CheckCircleIcon size={18} /> Successfully Logged Out
                  </motion.div>
              </motion.div>
          </div>
      );
  }

  // --- DASHBOARD ---
  if (view === View.PARENT_DASHBOARD) {
    const menuItems = [
        { label: "Attendance", icon: <CheckCircle />, color: "text-green-500", bg: "bg-green-100", view: View.PARENT_ATTENDANCE },
        { label: "Homework", icon: <Book />, color: "text-royal", bg: "bg-indigo-100", view: View.PARENT_HOMEWORK },
        { label: "Timetable", icon: <Calendar />, color: "text-neon", bg: "bg-purple-100", view: View.PARENT_TIMETABLE },
        { label: "Results", icon: <Activity />, color: "text-pink-500", bg: "bg-pink-100", view: View.PARENT_RESULTS },
        { label: "Exam Dates", icon: <Clock />, color: "text-orange-500", bg: "bg-orange-100", view: View.PARENT_EXAM_SCHEDULE }, // Added
        { label: "Fees", icon: <CreditCard />, color: "text-golden", bg: "bg-yellow-100", view: View.PARENT_FEES },
        { label: "Notices", icon: <Bell />, color: "text-red-500", bg: "bg-red-100", view: View.PARENT_NOTICES },
        { label: "Gallery", icon: <Image />, color: "text-orange-500", bg: "bg-orange-100", view: View.PARENT_GALLERY },
        { label: "Bus Track", icon: <Bus />, color: "text-aqua", bg: "bg-cyan-100", view: View.PARENT_BUS },
    ];

    return (
      <div className="p-6 h-full overflow-y-auto pb-24 bg-offwhite">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pt-4">
             <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                     <SchoolLogo />
                 </div>
                 <div>
                    <h1 className="text-xl font-black text-gray-900 leading-none">Parent Portal</h1>
                    <p className="text-sm font-bold text-gray-500 mt-1">Presidency Academy</p>
                 </div>
             </div>
             <button onClick={handleLogout} className="p-2 bg-red-50 text-red-500 rounded-full"><LogOut size={20}/></button>
        </div>

        {/* Child Profile Card */}
        <GlassCard className="mb-8 relative overflow-hidden bg-gradient-to-br from-royal to-blue-700 border-none text-white p-6">
            <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-full border-2 border-white/50 p-1">
                    <img src={childInfo.photo} className="w-full h-full rounded-full object-cover bg-gray-200" alt="Child" />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-black leading-none mb-1">{childInfo.name}</h2>
                    <p className="text-blue-200 text-sm font-medium">Class {childInfo.class} • Roll {childInfo.rollNo}</p>
                </div>
                <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="transform -rotate-90 w-full h-full absolute">
                        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-blue-900/30" />
                        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={150} strokeDashoffset={150 - (150 * childInfo.attendance) / 100} className="text-aqua" />
                    </svg>
                    <span className="text-xs font-bold">{childInfo.attendance}%</span>
                </div>
            </div>
            <div className="mt-6 flex justify-between items-center bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div>
                    <p className="text-[10px] text-blue-200 uppercase font-bold">Class Teacher</p>
                    <p className="font-bold text-sm">Mr. Verma</p>
                </div>
                <NeonButton variant="accent" className="py-2 px-4 text-xs" onClick={() => changeView(View.PARENT_CHAT)}>Message</NeonButton>
            </div>
        </GlassCard>

        {/* Menu Grid */}
        <SectionHeader title="Child's Progress" subtitle="Academic Overview" />
        <div className="grid grid-cols-3 gap-4">
            {menuItems.map((item, idx) => (
                <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => changeView(item.view)}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className={`w-16 h-16 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shadow-lg shadow-royal/5 relative overflow-hidden`}>
                         <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                         {React.cloneElement(item.icon, { size: 28 })}
                    </div>
                    <span className="text-xs font-bold text-gray-600">{item.label}</span>
                </motion.button>
            ))}
        </div>
      </div>
    );
  }

  // --- ATTENDANCE ---
  if (view === View.PARENT_ATTENDANCE) {
      const data = [
          { day: 'M', status: 'present' }, { day: 'T', status: 'present' },
          { day: 'W', status: 'absent' }, { day: 'T', status: 'present' },
          { day: 'F', status: 'present' }, { day: 'S', status: 'present' },
      ];
      return (
          <div className="p-6 h-full overflow-y-auto pb-24 bg-offwhite">
              {header("Attendance Record")}
              
              <GlassCard className="mb-6 bg-white">
                  <h3 className="font-bold text-gray-800 mb-4">October 2023</h3>
                  <div className="grid grid-cols-7 gap-2 mb-2">
                      {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-center text-xs text-gray-400 font-bold">{d}</span>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                      {Array.from({length: 31}).map((_, i) => {
                          const isAbsent = i === 12 || i === 24;
                          const isWeekend = (i+1)%7 === 0;
                          return (
                              <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold 
                                  ${isAbsent ? 'bg-red-100 text-red-500' : isWeekend ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-600'}`}>
                                  {i + 1}
                              </div>
                          )
                      })}
                  </div>
                  <div className="flex gap-4 mt-4 justify-center">
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-500"><div className="w-2 h-2 rounded-full bg-green-500"/> Present</div>
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-500"><div className="w-2 h-2 rounded-full bg-red-500"/> Absent</div>
                  </div>
              </GlassCard>

              <SectionHeader title="Trends" />
              <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{n:'Aug',p:90},{n:'Sep',p:95},{n:'Oct',p:92}]}>
                        <XAxis dataKey="n" axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: 12, border: 'none'}} />
                        <Bar dataKey="p" fill="#3A4CFF" radius={[5,5,5,5]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      )
  }

  // --- HOMEWORK ---
  if (view === View.PARENT_HOMEWORK) {
      return (
          <div className="p-6 h-full overflow-y-auto pb-24 bg-offwhite">
              {header("Homework")}
              <div className="flex gap-4 mb-6">
                  <button className="flex-1 py-2 bg-royal text-white rounded-full text-xs font-bold shadow-lg shadow-royal/30">Pending (2)</button>
                  <button className="flex-1 py-2 bg-white text-gray-400 rounded-full text-xs font-bold">Completed</button>
              </div>
              
              {[1, 2].map((i) => (
                  <GlassCard key={i} className="mb-4 bg-white/80">
                      <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold bg-red-100 text-red-500 px-2 py-1 rounded">Due Tomorrow</span>
                          <span className="text-gray-400 text-xs font-bold">Physics</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">Thermodynamics</h3>
                      <p className="text-xs text-gray-500 mb-3">Chapter 4: Solve Q1-10 in notebook.</p>
                      <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                          <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                          <span className="text-xs text-gray-500 font-bold">Assigned by Mr. Verma</span>
                      </div>
                  </GlassCard>
              ))}
          </div>
      )
  }

  // --- EXAM SCHEDULE (NEW) ---
  if (view === View.PARENT_EXAM_SCHEDULE) {
    const exams = [
        { date: "15 Nov", time: "09:00 AM", subject: "Physics", status: "Upcoming" },
        { date: "18 Nov", time: "09:00 AM", subject: "Mathematics", status: "Upcoming" },
        { date: "20 Nov", time: "09:00 AM", subject: "Chemistry", status: "Upcoming" },
        { date: "22 Nov", time: "09:00 AM", subject: "English", status: "Upcoming" },
        { date: "25 Nov", time: "09:00 AM", subject: "Computer Sci", status: "Upcoming" },
    ];
    return (
        <div className="p-6 h-full overflow-y-auto pb-24 bg-offwhite">
            {header("Exam Dates")}
            
            <GlassCard className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white border-none">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                        <Calendar size={32} />
                    </div>
                    <div>
                        <p className="text-orange-100 text-xs font-bold mb-1">Next Exam</p>
                        <h3 className="text-2xl font-black">Physics</h3>
                        <p className="text-sm font-bold opacity-90">15 Nov • 09:00 AM</p>
                    </div>
                </div>
            </GlassCard>

            <SectionHeader title="Datesheet" />
            <div className="space-y-4">
                {exams.map((exam, i) => (
                    <motion.div 
                        initial={{x: -20, opacity: 0}}
                        animate={{x: 0, opacity: 1}}
                        transition={{delay: i * 0.1}}
                        key={i} 
                        className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500 flex justify-between items-center"
                    >
                        <div className="flex gap-4 items-center">
                            <div className="flex flex-col items-center justify-center w-12 text-center">
                                <span className="text-lg font-black text-gray-800">{exam.date.split(' ')[0]}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{exam.date.split(' ')[1]}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{exam.subject}</h4>
                                <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10}/> {exam.time}</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-1 rounded-full">{exam.status}</span>
                    </motion.div>
                ))}
            </div>
            
            <div className="mt-8">
                <NeonButton fullWidth variant="primary" icon={<Download size={18}/>} onClick={() => alert("Downloading PDF...")}>
                    Download Full Schedule
                </NeonButton>
            </div>
        </div>
    )
  }

  // --- FEES ---
  if (view === View.PARENT_FEES) {
      return (
          <div className="p-6 h-full overflow-y-auto pb-24 bg-offwhite">
              {header("Fee Center")}
              
              <GlassCard className="mb-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white border-none h-48 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="flex justify-between items-start z-10">
                        <CreditCard className="text-gray-400" />
                        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold">Overdue</span>
                    </div>
                    <div className="z-10">
                        <p className="text-gray-400 text-xs mb-1">Total Due</p>
                        <h2 className="text-3xl font-black">$2,450.00</h2>
                        <p className="text-gray-500 text-xs mt-4">Due Date: 15 Oct 2023</p>
                    </div>
                </GlassCard>

                <NeonButton fullWidth className="mb-8" onClick={() => alert("Redirecting to Razorpay...")}>Pay Online Now</NeonButton>
                
                <h3 className="font-bold text-gray-800 mb-4">Payment History</h3>
                <div className="space-y-3">
                    <div className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm">
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Term 1 Fee</h4>
                            <p className="text-xs text-gray-400">Paid on 10 Aug</p>
                        </div>
                        <button className="text-royal font-bold text-xs"><Download size={16}/></button>
                    </div>
                </div>
          </div>
      )
  }

  // --- BUS TRACKING ---
  if (view === View.PARENT_BUS) {
      return (
          <div className="h-full flex flex-col bg-gray-50">
              <div className="p-6">{header("Bus Tracking")}</div>
              
              <div className="flex-1 relative bg-gray-200">
                  {/* Mock Map */}
                  <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.2090,28.6139,14,0,0/600x800?access_token=pk.mock')] bg-cover bg-center opacity-60"></div>
                  
                  {/* Bus Marker */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="w-12 h-12 bg-royal rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white z-10 relative">
                          <Bus size={20} />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      </div>
                      <div className="bg-white px-3 py-1 rounded-full shadow-md mt-2 text-xs font-bold">Bus No. 42</div>
                  </div>

                  {/* Details Card */}
                  <div className="absolute bottom-6 left-6 right-6">
                      <GlassCard className="bg-white/90 backdrop-blur-xl">
                          <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 rounded-full bg-gray-200">
                                  <img src="https://picsum.photos/100" className="w-full h-full rounded-full object-cover"/>
                              </div>
                              <div className="flex-1">
                                  <h4 className="font-bold text-gray-900">Ramesh Kumar</h4>
                                  <p className="text-xs text-gray-500">Driver • +91 98765 43210</p>
                              </div>
                              <a href="tel:+919876543210" className="p-3 bg-green-500 text-white rounded-full shadow-lg"><Phone size={18}/></a>
                          </div>
                          <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-3">
                              <div>
                                  <p className="text-gray-400 text-xs">ETA Home</p>
                                  <p className="font-bold text-royal">15 Mins</p>
                              </div>
                              <div>
                                  <p className="text-gray-400 text-xs">Speed</p>
                                  <p className="font-bold text-gray-800">45 km/h</p>
                              </div>
                          </div>
                      </GlassCard>
                  </div>
              </div>
          </div>
      )
  }

  // --- CHAT ---
  if (view === View.PARENT_CHAT) {
      return (
          <div className="h-full flex flex-col bg-white relative">
                <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
                    <button onClick={() => changeView(View.PARENT_DASHBOARD)}><ChevronLeft/></button>
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                        <img src="https://picsum.photos/200" className="w-full h-full object-cover"/>
                    </div>
                    <div>
                        <h2 className="font-bold text-sm text-gray-800">Mr. Verma</h2>
                        <p className="text-xs text-gray-500">Class Teacher</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-offwhite space-y-4 pb-24">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                                msg.sender === 'user' ? 'bg-royal text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="fixed bottom-24 left-4 right-4 z-40">
                    <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-full shadow-xl p-2 flex items-center gap-2">
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Message teacher..." 
                            className="flex-1 bg-transparent px-4 text-gray-800 placeholder-gray-400 focus:outline-none"
                        />
                        <button onClick={handleSendMessage} className="p-3 bg-royal text-white rounded-full"><Send size={18}/></button>
                    </div>
                </div>
          </div>
      )
  }

  // --- PROFILE ---
  if (view === View.PARENT_PROFILE) {
      return (
          <div className="p-6 h-full overflow-y-auto pb-24 bg-offwhite flex flex-col items-center">
              {header("Child Profile")}
              
              <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
                  <div className="h-32 bg-gradient-to-r from-royal to-neon relative">
                      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                          <img src={childInfo.photo} className="w-full h-full object-cover" />
                      </div>
                  </div>
                  <div className="pt-20 pb-8 px-6 text-center">
                      <h2 className="text-2xl font-black text-gray-900">{childInfo.name}</h2>
                      <p className="text-royal font-bold mb-6">Class {childInfo.class} (Science)</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-left bg-gray-50 p-4 rounded-xl">
                          <div><p className="text-xs text-gray-400">Roll No</p><p className="font-bold">{childInfo.rollNo}</p></div>
                          <div><p className="text-xs text-gray-400">Admission No</p><p className="font-bold">ADM-2023-045</p></div>
                          <div><p className="text-xs text-gray-400">DOB</p><p className="font-bold">12 Aug 2006</p></div>
                          <div><p className="text-xs text-gray-400">Blood Group</p><p className="font-bold">B+</p></div>
                      </div>
                  </div>
              </div>

              <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-sm mb-6">
                  <h3 className="font-bold text-gray-800 mb-4">Parent Details</h3>
                  <div className="space-y-3">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-royal"><User size={18}/></div>
                          <div><p className="text-xs text-gray-400">Father's Name</p><p className="font-bold text-sm">Mr. Rajesh Sharma</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600"><Phone size={18}/></div>
                          <div><p className="text-xs text-gray-400">Emergency Contact</p><p className="font-bold text-sm">+91 98765 43210</p></div>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  // --- RESULTS ---
  if (view === View.PARENT_RESULTS) {
      return (
          <div className="p-6 h-full overflow-y-auto pb-24 bg-offwhite">
              {header("Academic Results")}
              <GlassCard className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white mb-6">
                  <div className="flex justify-between items-center">
                      <div>
                          <p className="text-purple-200 text-xs font-bold uppercase">Overall Grade</p>
                          <h2 className="text-5xl font-black mt-1">A+</h2>
                      </div>
                      <div className="text-right">
                          <p className="text-3xl font-bold">94.5%</p>
                          <p className="text-purple-200 text-xs">Term 1 Aggregate</p>
                      </div>
                  </div>
              </GlassCard>

              <SectionHeader title="Performance Chart" />
              <div className="h-64 w-full bg-white rounded-3xl p-4 shadow-sm mb-6">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                        { subject: 'Math', A: 95, fullMark: 100 },
                        { subject: 'Phys', A: 88, fullMark: 100 },
                        { subject: 'Chem', A: 92, fullMark: 100 },
                        { subject: 'Eng', A: 85, fullMark: 100 },
                        { subject: 'Comp', A: 98, fullMark: 100 },
                    ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Student" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
          </div>
      )
  }

  // --- NOTICES ---
  if (view === View.PARENT_NOTICES) {
      return (
          <div className="p-6 h-full overflow-y-auto pb-24 bg-offwhite">
              {header("School Circulars")}
              <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                      <GlassCard key={i} className="bg-white">
                          <div className="flex justify-between items-start mb-2">
                              <span className="px-2 py-1 bg-red-100 text-red-500 rounded text-[10px] font-bold uppercase">Important</span>
                              <span className="text-gray-400 text-[10px] font-bold">2 Hours Ago</span>
                          </div>
                          <h3 className="font-bold text-gray-800 text-sm mb-1">Parent Teacher Meeting</h3>
                          <p className="text-xs text-gray-500 leading-relaxed">Dear Parents, the PTM for Term 1 results will be held on Saturday, 28th Oct from 9 AM to 12 PM.</p>
                      </GlassCard>
                  ))}
              </div>
          </div>
      )
  }

  // --- GALLERY ---
  if (view === View.PARENT_GALLERY) {
      return (
          <div className="p-6 h-full overflow-y-auto pb-24 bg-offwhite">
              {header("School Gallery")}
              <div className="grid grid-cols-2 gap-3">
                  {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="rounded-2xl overflow-hidden shadow-sm aspect-square relative group">
                          <img src={`https://picsum.photos/300?random=${i}`} className="w-full h-full object-cover"/>
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white font-bold text-xs">Annual Day</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )
  }

  // --- TIMETABLE ---
  if (view === View.PARENT_TIMETABLE) {
      return (
          <div className="p-6 h-full overflow-y-auto pb-24 bg-offwhite">
              {header("Class Schedule")}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                   <div className="flex justify-between items-center mb-6">
                       <button className="text-gray-400"><ChevronLeft/></button>
                       <span className="font-bold text-gray-800">Wednesday</span>
                       <button className="text-gray-400"><ChevronLeft className="rotate-180"/></button>
                   </div>
                   <div className="space-y-4">
                       {[
                           {t: '08:30', s: 'Math', a: false},
                           {t: '09:30', s: 'Physics', a: true},
                           {t: '10:30', s: 'Chemistry', a: false},
                           {t: '11:30', s: 'Break', a: false, b: true},
                           {t: '12:00', s: 'English', a: false},
                       ].map((slot, i) => (
                           <div key={i} className={`flex items-center gap-4 ${slot.a ? 'scale-105' : 'opacity-70'}`}>
                               <span className="text-xs font-bold text-gray-400 w-10">{slot.t}</span>
                               <div className={`flex-1 p-3 rounded-xl ${slot.a ? 'bg-royal text-white shadow-lg shadow-royal/30' : 'bg-gray-50 text-gray-800'}`}>
                                   <p className="font-bold text-sm">{slot.s}</p>
                                   {!slot.b && <p className={`text-[10px] ${slot.a ? 'text-blue-100' : 'text-gray-400'}`}>Room 302</p>}
                               </div>
                           </div>
                       ))}
                   </div>
              </div>
          </div>
      )
  }

  return null;
};

export default ParentViews;
