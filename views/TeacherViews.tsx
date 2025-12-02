
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { View } from '../types';
import { GlassCard, NeonButton, FloatingInput, SchoolLogo, SectionHeader } from '../components/Common';
import { 
  CheckCircle, Book, Bell, Users, Settings, LogOut, 
  ChevronLeft, Calendar, FileText, UploadCloud, Send, 
  CheckSquare, XCircle, Search, Power, CheckCircle as CheckCircleIcon,
  Plus, Edit2, Trash2, Clock, Mail, MapPin, Phone, Loader2
} from 'lucide-react';
import { 
  subscribeToCollection, 
  markAttendance, 
  createHomework, 
  publishNotice, 
  logoutUser,
  getUserProfile,
  UserProfile,
  subscribeToClasses,
  formatClassOptions
} from '../services/firebaseService';
import { User } from 'firebase/auth';

interface Props {
  view: View;
  changeView: (view: View) => void;
  user: User | null;
}

const TeacherViews: React.FC<Props> = ({ view, changeView, user }) => {

  // --- STATE ---
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Class Management State
  const [classOptions, setClassOptions] = useState<{label: string, value: string, className: string, section: string}[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  // Profile State
  const [teacherProfile, setTeacherProfile] = useState<UserProfile | null>(null);

  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatus, setAttendanceStatus] = useState<{[key: string]: 'present' | 'absent' | 'late'}>({});
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  // Homework State
  const [hwForm, setHwForm] = useState({ title: '', description: '', dueDate: '', subject: 'Physics' });
  const [hwSubmitted, setHwSubmitted] = useState(false);

  // Notice State
  const [noticeForm, setNoticeForm] = useState({ title: '', body: '', audience: 'Students' });
  const [noticeSubmitted, setNoticeSubmitted] = useState(false);

  // Logout State
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // --- DATA FETCHING ---
  
  // 1. Fetch Students
  useEffect(() => {
    const unsub = subscribeToCollection('students', (data) => {
        setStudents(data);
        setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Fetch Classes for Dropdown (Real-time) using Helper
  useEffect(() => {
      const unsubClasses = subscribeToClasses((data) => {
          const formatted = formatClassOptions(data);
          setClassOptions(formatted);
          setIsLoadingClasses(false);

          // Auto-select first class if none selected
          if (formatted.length > 0 && !selectedClass) {
              setSelectedClass(formatted[0].value);
          }
      });
      return () => unsubClasses();
  }, [selectedClass]);

  // 3. Filter Students based on Selected Class
  useEffect(() => {
      if (selectedClass && students.length > 0) {
          const currentOption = classOptions.find(o => o.value === selectedClass);
          
          if (currentOption) {
              const filtered = students.filter(s => {
                  // Logic: Check if student class/section matches selected option
                  // Note: Ensure student data in DB has 'class' and 'section' fields matching Super Admin's format
                  // Loose matching used here for flexibility
                  const matchClass = s.class === currentOption.className;
                  const matchSection = s.section === currentOption.section;
                  
                  // If student has no section assigned, maybe show them? Or strict mode?
                  // For now, simple match.
                  return matchClass && (matchSection || !currentOption.section); 
              });
              setFilteredStudents(filtered);

              // Initialize attendance status
              const initialStatus: any = {};
              filtered.forEach((s: any) => initialStatus[s.uid] = 'present');
              setAttendanceStatus(prev => ({...initialStatus, ...prev}));
          } else {
              setFilteredStudents([]);
          }
      } else {
          setFilteredStudents([]);
      }
  }, [selectedClass, students, classOptions]);

  // Fetch Profile when on Profile View
  useEffect(() => {
    if (view === View.TEACHER_PROFILE && user) {
        getUserProfile(user.uid).then(profile => {
            if (profile) {
                setTeacherProfile(profile);
                // Also update local selected class if available in profile (and matches an existing option)
                if(profile.class) {
                     // Try to match profile class to options
                     // This is a simple heuristic
                     const match = classOptions.find(o => o.value === profile.class || o.className === profile.class);
                     if(match) setSelectedClass(match.value);
                }
            }
        });
    }
  }, [view, user, classOptions]);

  // --- HANDLERS ---
  
  const handleAttendanceToggle = (uid: string) => {
      setAttendanceStatus(prev => ({
          ...prev,
          [uid]: prev[uid] === 'present' ? 'absent' : (prev[uid] === 'absent' ? 'late' : 'present')
      }));
  };

  const handleSaveAttendance = async () => {
      if (!selectedClass) return alert("Please select a class first.");
      await markAttendance(selectedClass, attendanceDate, attendanceStatus);
      setAttendanceSaved(true);
      setTimeout(() => setAttendanceSaved(false), 2000);
  };

  const handleCreateHomework = async () => {
      if(!hwForm.title || !hwForm.dueDate) return alert("Please fill required fields");
      await createHomework(selectedClass, hwForm);
      setHwSubmitted(true);
      setTimeout(() => {
          setHwSubmitted(false);
          setHwForm({ title: '', description: '', dueDate: '', subject: 'Physics' });
      }, 2000);
  };

  const handlePublishNotice = async () => {
      if(!noticeForm.title || !noticeForm.body) return alert("Please fill required fields");
      await publishNotice({ ...noticeForm, author: user?.displayName || 'Teacher' });
      setNoticeSubmitted(true);
      setTimeout(() => {
          setNoticeSubmitted(false);
          setNoticeForm({ title: '', body: '', audience: 'Students' });
      }, 2000);
  };

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

  const header = (title: string, back = true) => (
    <div className="flex items-center justify-between mb-6 pt-4 sticky top-0 bg-offwhite/90 backdrop-blur-md py-4 z-20">
      <div className="flex items-center gap-4">
        {back && (
          <button onClick={() => changeView(View.TEACHER_DASHBOARD)} className="p-2 rounded-full bg-white shadow-md text-gray-700 active:scale-90 transition-transform">
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
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-lg">
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
                  <p className="text-gray-500 font-medium">Session ending</p>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full"
                  >
                      <CheckCircleIcon size={18} /> Successfully Logged Out
                  </motion.div>
              </motion.div>
          </div>
      );
  }

  // --- DASHBOARD ---
  if (view === View.TEACHER_DASHBOARD) {
      const stats = [
          { l: "Class Strength", v: filteredStudents.length > 0 ? filteredStudents.length.toString() : "42", i: <Users />, c: "text-royal", bg: "bg-blue-50" },
          { l: "Pending H.W.", v: "15", i: <Book />, c: "text-neon", bg: "bg-purple-50" },
          { l: "Notices Sent", v: "8", i: <Bell />, c: "text-aqua", bg: "bg-cyan-50" },
          { l: "Avg Attendance", v: "94%", i: <CheckCircle />, c: "text-green-500", bg: "bg-green-50" },
      ];

      const menu = [
          { l: "Take Attendance", i: <CheckCircle />, v: View.TEACHER_ATTENDANCE, c: "bg-royal text-white" },
          { l: "Give Homework", i: <Book />, v: View.TEACHER_HOMEWORK, c: "bg-neon text-white" },
          { l: "Publish Notice", i: <Bell />, v: View.TEACHER_NOTICES, c: "bg-red-500 text-white" },
          { l: "My Students", i: <Users />, v: View.TEACHER_STUDENTS, c: "bg-aqua text-blue-900" },
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
                          <h1 className="text-xl font-black text-gray-900 leading-none">Welcome,</h1>
                          <p className="text-sm font-bold text-royal mt-1">{user?.displayName || "Teacher"}</p>
                      </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-neon text-white flex items-center justify-center font-bold shadow-lg shadow-neon/30">
                      {user?.displayName?.charAt(0) || "T"}
                  </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                  {stats.map((s, i) => (
                      <GlassCard key={i} className={`p-4 flex flex-col justify-between h-24 ${s.bg} border-white/60`}>
                          <div className="flex justify-between">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">{s.l}</span>
                              <div className={s.c}>{React.cloneElement(s.i as any, { size: 16 })}</div>
                          </div>
                          <span className="text-2xl font-black text-gray-800">{s.v}</span>
                      </GlassCard>
                  ))}
              </div>

              {/* Quick Actions */}
              <SectionHeader title="Quick Actions" />
              <div className="grid grid-cols-2 gap-4">
                  {menu.map((m, i) => (
                      <motion.button
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => changeView(m.v)}
                          className={`p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 ${m.c} relative overflow-hidden group`}
                      >
                           <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          {React.cloneElement(m.i as any, { size: 32 })}
                          <span className="font-bold text-sm">{m.l}</span>
                      </motion.button>
                  ))}
              </div>
          </div>
      );
  }

  // --- ATTENDANCE ---
  if (view === View.TEACHER_ATTENDANCE) {
      return (
          <div className="p-6 h-full overflow-y-auto pb-24 bg-offwhite">
              {header("Attendance")}
              
              <GlassCard className="bg-white mb-6">
                  <div className="flex gap-4 mb-4">
                       <div className="flex-1 relative">
                           {isLoadingClasses ? (
                               <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-xl">
                                   <Loader2 className="animate-spin text-royal" size={18} />
                               </div>
                           ) : (
                               <select 
                                    value={selectedClass} 
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none appearance-none"
                                >
                                   {classOptions.length === 0 && <option value="">No Classes Found</option>}
                                   {classOptions.map((opt) => (
                                       <option key={opt.value} value={opt.value}>{opt.label}</option>
                                   ))}
                               </select>
                           )}
                           <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                               <ChevronLeft size={16} className="-rotate-90"/>
                           </div>
                       </div>
                       
                       <input 
                            type="date" 
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="flex-1 p-3 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none"
                       />
                  </div>
              </GlassCard>

              {attendanceSaved && (
                   <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="bg-green-100 text-green-700 p-3 rounded-xl mb-4 text-center font-bold flex items-center justify-center gap-2">
                       <CheckCircleIcon size={18}/> Saved Successfully
                   </motion.div>
              )}

              <div className="space-y-3">
                  {isLoading && <p className="text-center text-gray-400">Loading students...</p>}
                  
                  {!isLoading && filteredStudents.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                          <Users size={32} className="mb-2 opacity-50"/>
                          <p>No students in this class.</p>
                      </div>
                  )}

                  {filteredStudents.map(s => (
                      <div key={s.uid} className="bg-white p-3 rounded-xl flex justify-between items-center shadow-sm border border-gray-100">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-royal/10 flex items-center justify-center font-bold text-royal">
                                  {s.name.charAt(0)}
                              </div>
                              <div>
                                  <span className="font-bold text-gray-800 block leading-tight">{s.name}</span>
                                  <span className="text-[10px] text-gray-400 font-medium">Roll No. {s.rollNo || 'N/A'}</span>
                              </div>
                          </div>
                          <button 
                              onClick={() => handleAttendanceToggle(s.uid)}
                              className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors w-24 border ${
                                  attendanceStatus[s.uid] === 'present' ? 'bg-green-100 text-green-600 border-green-200' :
                                  attendanceStatus[s.uid] === 'absent' ? 'bg-red-100 text-red-500 border-red-200' :
                                  'bg-yellow-100 text-yellow-600 border-yellow-200'
                              }`}
                          >
                              {attendanceStatus[s.uid]?.toUpperCase() || 'PRESENT'}
                          </button>
                      </div>
                  ))}
              </div>
              
              <div className="fixed bottom-24 left-6 right-6">
                  <NeonButton fullWidth onClick={handleSaveAttendance}>Save Attendance Record</NeonButton>
              </div>
          </div>
      )
  }

  // --- HOMEWORK ---
  if (view === View.TEACHER_HOMEWORK) {
      if(hwSubmitted) {
           return (
              <div className="h-full flex flex-col items-center justify-center p-6 bg-offwhite">
                  <div className="w-24 h-24 bg-neon/20 text-neon rounded-full flex items-center justify-center mb-6">
                      <CheckCircleIcon size={48} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-800">Homework Assigned!</h2>
                  <p className="text-gray-500 text-center mt-2">Students notified instantly.</p>
                  <button onClick={() => setHwSubmitted(false)} className="mt-8 text-neon font-bold">Assign Another</button>
              </div>
          )
      }
      return (
          <div className="p-6 h-full overflow-y-auto pb-24 bg-offwhite">
              {header("Add Homework")}
              
              <GlassCard className="bg-white">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Book size={18}/> Assignment Details</h3>
                  
                  {/* Dynamic Class Selector for Homework */}
                  <div className="mb-4">
                       <label className="text-xs font-bold text-gray-500 mb-2 block">Select Class</label>
                       <select 
                            value={selectedClass} 
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 appearance-none"
                        >
                           {classOptions.map((opt) => (
                               <option key={opt.value} value={opt.value}>{opt.label}</option>
                           ))}
                       </select>
                  </div>

                  <div className="mb-4">
                       <label className="text-xs font-bold text-gray-500 mb-2 block">Subject</label>
                       <select 
                            value={hwForm.subject} 
                            onChange={(e) => setHwForm({...hwForm, subject: e.target.value})}
                            className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700"
                        >
                           <option>Physics</option>
                           <option>Chemistry</option>
                           <option>Maths</option>
                           <option>English</option>
                           <option>Computer Science</option>
                           <option>Biology</option>
                       </select>
                  </div>

                  <FloatingInput 
                        label="Topic / Title" 
                        value={hwForm.title} 
                        onChange={(e) => setHwForm({...hwForm, title: e.target.value})}
                        icon={<FileText size={18}/>}
                  />

                  <div className="mb-4">
                       <label className="text-xs font-bold text-gray-500 mb-2 block">Due Date</label>
                       <input 
                            type="date"
                            value={hwForm.dueDate}
                            onChange={(e) => setHwForm({...hwForm, dueDate: e.target.value})}
                            className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700"
                       />
                  </div>

                  <div className="relative group mb-6">
                       <textarea 
                            value={hwForm.description}
                            onChange={(e) => setHwForm({...hwForm, description: e.target.value})}
                            placeholder="Description / Instructions..."
                            className="w-full p-4 h-32 bg-gray-50 rounded-2xl outline-none font-medium text-gray-700 resize-none"
                       ></textarea>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 mb-6 cursor-pointer hover:bg-gray-50 transition-colors">
                      <UploadCloud size={24} className="mb-2"/>
                      <p className="text-xs font-bold">Attach File (PDF/IMG)</p>
                  </div>

                  <NeonButton fullWidth variant="secondary" onClick={handleCreateHomework}>Assign Homework</NeonButton>
              </GlassCard>
          </div>
      )
  }

  // --- NOTICES ---
  if (view === View.TEACHER_NOTICES) {
       if(noticeSubmitted) {
           return (
              <div className="h-full flex flex-col items-center justify-center p-6 bg-offwhite">
                  <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
                      <Bell size={48} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-800">Notice Published!</h2>
                  <p className="text-gray-500 text-center mt-2">Sent to {noticeForm.audience}</p>
                  <button onClick={() => setNoticeSubmitted(false)} className="mt-8 text-red-500 font-bold">Publish Another</button>
              </div>
          )
      }
      return (
          <div className="p-6 h-full overflow-y-auto pb-24 bg-offwhite">
              {header("Create Notice")}
              
              <GlassCard className="bg-white">
                  <FloatingInput 
                        label="Notice Title" 
                        value={noticeForm.title} 
                        onChange={(e) => setNoticeForm({...noticeForm, title: e.target.value})}
                        icon={<Bell size={18}/>}
                  />

                   <div className="mb-4">
                       <label className="text-xs font-bold text-gray-500 mb-2 block">Target Audience</label>
                       <div className="flex gap-2">
                           {['Students', 'Parents', 'Everyone'].map(a => (
                               <button 
                                    key={a}
                                    onClick={() => setNoticeForm({...noticeForm, audience: a})}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${noticeForm.audience === a ? 'bg-royal text-white' : 'bg-gray-100 text-gray-500'}`}
                                >
                                   {a}
                               </button>
                           ))}
                       </div>
                  </div>

                  <textarea 
                        value={noticeForm.body}
                        onChange={(e) => setNoticeForm({...noticeForm, body: e.target.value})}
                        placeholder="Write your announcement here..."
                        className="w-full p-4 h-40 bg-gray-50 rounded-2xl outline-none font-medium text-gray-700 resize-none mb-6"
                   ></textarea>

                  <NeonButton fullWidth variant="warning" onClick={handlePublishNotice}>Publish Notice</NeonButton>
              </GlassCard>
          </div>
      )
  }

  // --- STUDENTS LIST ---
  if (view === View.TEACHER_STUDENTS) {
      return (
          <div className="p-6 h-full overflow-y-auto pb-24 bg-offwhite">
              {header("My Students")}
              
              <div className="flex gap-4 mb-4">
                  <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="flex-1 p-3 bg-white rounded-xl font-bold text-gray-700 outline-none border border-gray-100"
                  >
                        {classOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                  </select>
              </div>

              <div className="relative mb-6">
                  <Search className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                  <input type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-royal" />
              </div>

              <div className="space-y-3">
                  {!isLoading && filteredStudents.length === 0 && (
                      <p className="text-center text-gray-400 py-4">No students in selected class.</p>
                  )}
                  {filteredStudents.map(s => (
                      <GlassCard key={s.uid} className="bg-white p-4 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 text-lg">
                                  {s.name.charAt(0)}
                              </div>
                              <div>
                                  <h4 className="font-bold text-gray-900">{s.name}</h4>
                                  <p className="text-xs text-gray-500">{s.email}</p>
                                  <div className="flex gap-2 mt-1">
                                      <span className="text-[10px] bg-green-100 text-green-600 px-2 rounded-full font-bold">92% Att.</span>
                                      <span className="text-[10px] bg-purple-100 text-purple-600 px-2 rounded-full font-bold">A Grade</span>
                                  </div>
                              </div>
                          </div>
                      </GlassCard>
                  ))}
              </div>
          </div>
      )
  }

  // --- PROFILE ---
  if (view === View.TEACHER_PROFILE) {
      const displaySubject = teacherProfile?.subject || "Subject Teacher";
      const displayClass = teacherProfile?.class || "N/A";

      return (
          <div className="p-6 h-full overflow-y-auto pb-24 bg-offwhite flex flex-col items-center">
              {header("Teacher Profile")}
              
              <div className="w-24 h-24 bg-neon text-white rounded-full flex items-center justify-center font-black text-3xl mb-4 shadow-xl shadow-neon/30 border-4 border-white">
                  {user?.displayName?.charAt(0) || "T"}
              </div>
              <h3 className="text-xl font-black text-gray-900">{user?.displayName}</h3>
              <p className="text-sm text-gray-500 font-bold mb-8 flex items-center gap-1">
                 {displaySubject} Faculty
              </p>

              <GlassCard className="bg-white w-full mb-6">
                  <div className="space-y-4">
                      <div className="flex justify-between p-3 bg-gray-50 rounded-xl items-center">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Mail size={16}/></div>
                              <span className="text-sm font-bold text-gray-500">Email</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{user?.email}</span>
                      </div>
                       <div className="flex justify-between p-3 bg-gray-50 rounded-xl items-center">
                          <div className="flex items-center gap-3">
                               <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Users size={16}/></div>
                               <span className="text-sm font-bold text-gray-500">Class Teacher</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{displayClass}</span>
                      </div>
                       <div className="flex justify-between p-3 bg-gray-50 rounded-xl items-center">
                          <div className="flex items-center gap-3">
                               <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Book size={16}/></div>
                               <span className="text-sm font-bold text-gray-500">Specialization</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{displaySubject}</span>
                      </div>
                  </div>
                  <div className="mt-6">
                      <NeonButton variant="secondary" fullWidth icon={<Edit2 size={16}/>} onClick={() => alert("Edit Profile Feature Coming Soon")}>
                          Edit Profile Details
                      </NeonButton>
                  </div>
              </GlassCard>

              <button onClick={handleLogout} className="w-full py-4 rounded-2xl border-2 border-red-100 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
                  <LogOut size={20}/> Sign Out
              </button>
          </div>
      )
  }

  return null;
};

export default TeacherViews;
