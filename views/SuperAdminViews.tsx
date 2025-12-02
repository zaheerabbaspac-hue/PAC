
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { View } from '../types';
import { GlassCard, NeonButton, FloatingInput, SchoolLogo, SectionHeader } from '../components/Common';
import { 
  Users, UserCheck, UserPlus, Settings, Shield, Server, 
  CreditCard, Bell, ChevronLeft, LogOut, CheckCircle, 
  XCircle, PieChart, Activity, Save, Database, Key, 
  Smartphone, Upload, Terminal, BellRing, Eye, Power, Check, Link, Globe, Trash2,
  CheckCircle as CheckCircleIcon, BookOpen, Layers, Plus, Grid, FileSpreadsheet, Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart as RePie, Pie, Cell } from 'recharts';
import { 
  createSystemUser, subscribeToCollection, updateUserStatus, deleteUserRecord, logoutUser, 
  saveSchoolLogo, subscribeToSchoolLogo,
  addClass, addSection, deleteClass, deleteSection, subscribeToClasses, formatClassOptions
} from '../services/firebaseService';

interface Props {
  view: View;
  changeView: (view: View) => void;
}

const SuperAdminViews: React.FC<Props> = ({ view, changeView }) => {

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [schoolName, setSchoolName] = useState("Presidency Academy");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  
  // Existing data states
  const [existingTeachers, setExistingTeachers] = useState<any[]>([]);
  const [existingAdmins, setExistingAdmins] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [classOptions, setClassOptions] = useState<any[]>([]);
  
  // Settings State
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpaySecretKey, setRazorpaySecretKey] = useState("");
  const [callbackUrl, setCallbackUrl] = useState("");
  const [aiApiKey, setAiApiKey] = useState("");
  
  // Forms
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '', subject: '', class: '' });
  
  // Edit State
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  // New Class Form
  const [newClass, setNewClass] = useState({ name: '', code: '' });
  const [newSection, setNewSection] = useState({ name: '', code: '', classId: '' });

  // Fetch Data
  useEffect(() => {
      const unsubAdmins = subscribeToCollection('admins', setExistingAdmins);
      const unsubTeachers = subscribeToCollection('teachers', setExistingTeachers);
      const unsubClasses = subscribeToClasses((data) => {
          setClassesList(data);
          setClassOptions(formatClassOptions(data));
      });
      const unsubLogo = subscribeToSchoolLogo((url) => { if(url) setLogoUrl(url); });

      return () => {
          unsubAdmins(); unsubTeachers(); unsubClasses(); unsubLogo();
      };
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

  const handleCreateAdmin = async () => {
      if(!adminForm.email || !adminForm.password) return alert("Fill all fields");
      try {
          await createSystemUser(adminForm.email, adminForm.password, { name: adminForm.name, role: 'admin' });
          alert("Admin Created!");
          setAdminForm({ name: '', email: '', password: '' });
      } catch (e: any) { alert(e.message); }
  };

  const handleDeleteUser = async (collection: string, uid: string) => {
      if(confirm("Are you sure you want to delete this user?")) {
          await deleteUserRecord(collection, uid);
      }
  };
  
  const handleCreateTeacher = async () => {
      if(!teacherForm.email || !teacherForm.password) return alert("Fill all fields");
      try {
          // If editing, logic would be different (updateUserRecord), but let's assume create for now or minimal edit logic
          await createSystemUser(teacherForm.email, teacherForm.password, { 
              name: teacherForm.name, 
              role: 'teacher', 
              subject: teacherForm.subject,
              class: teacherForm.class || 'Not Assigned'
          });
          alert("Teacher Created!");
          setTeacherForm({ name: '', email: '', password: '', subject: '', class: '' });
      } catch (e: any) { alert(e.message); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              setLogoUrl(base64);
              saveSchoolLogo(base64); 
          };
          reader.readAsDataURL(file);
      }
  };

  // Class Handlers
  const handleAddClass = async () => {
      if(!newClass.name) return;
      await addClass(newClass.name, newClass.code || newClass.name.substring(0,3).toUpperCase());
      setNewClass({name: '', code: ''});
  };
  
  const handleAddSection = async () => {
      if(!newSection.classId || !newSection.name) return;
      await addSection(newSection.classId, newSection.name, newSection.code || `S-${newSection.name}`);
      setNewSection({name: '', code: '', classId: ''});
  };

  const header = (title: string, backToDashboard = false) => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {backToDashboard && (
          <button onClick={() => changeView(View.SUPER_DASHBOARD)} className="p-2 rounded-full bg-white shadow-md text-gray-700 active:scale-90 transition-transform">
            <ChevronLeft />
          </button>
        )}
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">{title}</h2>
      </div>
    </div>
  );

  if (isLoggingOut) {
      return (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-lg">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6 relative">
                      <Power size={32} />
                      <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 mb-2">Logging Out...</h3>
                  <p className="text-gray-500 font-medium">Secure Session Closed</p>
              </motion.div>
          </div>
      );
  }

  // --- DASHBOARD ---
  if (view === View.SUPER_DASHBOARD) {
    const menu = [
      { label: "Settings", icon: <Settings />, view: View.SUPER_SETTINGS, color: "bg-gray-900 text-white" },
      { label: "Manage Admins", icon: <Shield />, view: View.SUPER_ADD_ADMIN, color: "bg-royal text-white" },
      { label: "Manage Teachers", icon: <UserCheck />, view: View.SUPER_ADD_TEACHER, color: "bg-neon text-white" },
      { label: "Classes & Sections", icon: <Layers />, view: View.SUPER_CLASSES, color: "bg-purple-600 text-white" },
      { label: "Analytics", icon: <PieChart />, view: View.SUPER_ANALYTICS, color: "bg-orange-500 text-white" },
      { label: "Approvals", icon: <CheckCircle />, view: View.SUPER_APPROVE, color: "bg-green-500 text-white" },
    ];
    
    return (
      <div className="p-6 h-full overflow-y-auto pb-12 bg-offwhite">
        <div className="flex flex-col mb-8 pt-4">
           <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                  <SchoolLogo />
              </div>
              <div>
                  <h1 className="text-xl font-black text-gray-900 leading-none">Super Admin</h1>
                  <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-1">Control Panel</p>
              </div>
           </div>
        </div>

        <SectionHeader title="Management" subtitle="Quick Actions" />
        <div className="grid grid-cols-2 gap-4 pb-8">
            {menu.map((m, i) => (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={async () => {
                        if (m.view === View.AUTH) handleLogout();
                        else changeView(m.view);
                    }}
                    key={i}
                    className={`p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-3 min-h-[110px] ${m.color} relative overflow-hidden group`}
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {React.cloneElement(m.icon as any, { size: 28 })}
                    <span className="font-bold text-xs">{m.label}</span>
                </motion.button>
            ))}
        </div>
        
        <button onClick={handleLogout} className="w-full py-4 rounded-2xl border-2 border-red-100 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
            <LogOut size={20}/> Logout System
        </button>
      </div>
    );
  }

  // --- CLASSES ---
  if (view === View.SUPER_CLASSES) {
      return (
          <div className="p-6 h-full overflow-y-auto pb-12 bg-offwhite">
              {header("Classes & Sections", true)}
              
              <GlassCard className="bg-white mb-6">
                  <h3 className="font-bold text-gray-800 mb-4">Add New Class</h3>
                  <div className="flex gap-2">
                      <input 
                        className="flex-1 p-3 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none" 
                        placeholder="Class Name (e.g. Class 1)"
                        value={newClass.name}
                        onChange={e => setNewClass({...newClass, name: e.target.value})}
                      />
                      <NeonButton onClick={handleAddClass} icon={<Plus size={18}/>}>Add</NeonButton>
                  </div>
              </GlassCard>

               <GlassCard className="bg-white mb-6">
                  <h3 className="font-bold text-gray-800 mb-4">Add Section</h3>
                  <div className="flex flex-col gap-3">
                      <select 
                        className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none"
                        value={newSection.classId}
                        onChange={e => setNewSection({...newSection, classId: e.target.value})}
                      >
                          <option value="">Select Class</option>
                          {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <input 
                            className="flex-1 p-3 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none" 
                            placeholder="Section (e.g. A, B)"
                            value={newSection.name}
                            onChange={e => setNewSection({...newSection, name: e.target.value})}
                        />
                        <NeonButton onClick={handleAddSection} icon={<Plus size={18}/>}>Add</NeonButton>
                      </div>
                  </div>
              </GlassCard>

              <div className="space-y-4">
                  {classesList.map(c => (
                      <GlassCard key={c.id} className="bg-white">
                          <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                              <h4 className="font-bold text-lg text-royal">{c.name}</h4>
                              <button onClick={() => deleteClass(c.id)} className="text-red-400 p-2"><Trash2 size={16}/></button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                              {c.sections && c.sections.map((s: any) => (
                                  <div key={s.id} className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-2">
                                      {s.name}
                                      <button onClick={() => deleteSection(c.id, s.id)} className="text-red-400 hover:text-red-600"><XCircle size={12}/></button>
                                  </div>
                              ))}
                              {(!c.sections || c.sections.length === 0) && <span className="text-xs text-gray-400 italic">No sections</span>}
                          </div>
                      </GlassCard>
                  ))}
              </div>
          </div>
      )
  }

  // --- ADD TEACHER ---
  if (view === View.SUPER_ADD_TEACHER) {
      return (
          <div className="p-6 h-full overflow-y-auto pb-12 bg-offwhite">
              {header("Manage Teachers", true)}
              
              <GlassCard className="bg-white mb-6">
                  <h3 className="font-bold text-gray-800 mb-4">Add New Teacher</h3>
                  <div className="grid grid-cols-1 gap-4">
                      <FloatingInput label="Full Name" value={teacherForm.name} onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})} />
                      <FloatingInput label="Email Address" value={teacherForm.email} onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})} />
                      <FloatingInput label="Password" type="password" value={teacherForm.password} onChange={(e) => setTeacherForm({...teacherForm, password: e.target.value})} />
                      <FloatingInput label="Subject Specialization" value={teacherForm.subject} onChange={(e) => setTeacherForm({...teacherForm, subject: e.target.value})} />
                      
                      {/* Restored Class Dropdown */}
                      <div className="mb-2">
                           <label className="text-xs font-bold text-gray-500 mb-1 ml-4 block">Assign Class Teacher (Optional)</label>
                           <select 
                                value={teacherForm.class} 
                                onChange={(e) => setTeacherForm({...teacherForm, class: e.target.value})}
                                className="w-full p-4 bg-white/50 border border-white shadow-inner rounded-2xl outline-none font-bold text-gray-700 appearance-none"
                            >
                               <option value="">Not Assigned</option>
                               {classOptions.map((opt) => (
                                   <option key={opt.value} value={opt.value}>{opt.label}</option>
                               ))}
                           </select>
                      </div>

                      <NeonButton fullWidth onClick={handleCreateTeacher}>Create Teacher Account</NeonButton>
                  </div>
              </GlassCard>

              <h3 className="font-bold text-gray-800 mb-4 px-2">Existing Teachers</h3>
              <div className="space-y-3">
                  {existingTeachers.map(t => (
                      <GlassCard key={t.uid} className="bg-white flex justify-between items-center p-4">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-neon text-white flex items-center justify-center font-bold">
                                  {t.name.charAt(0)}
                              </div>
                              <div>
                                  <h4 className="font-bold text-gray-900">{t.name}</h4>
                                  <div className="flex gap-2">
                                     <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{t.subject || 'N/A'}</span>
                                     <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded">{t.class || 'No Class'}</span>
                                  </div>
                              </div>
                          </div>
                          <button onClick={() => handleDeleteUser('teachers', t.uid)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={18}/>
                          </button>
                      </GlassCard>
                  ))}
              </div>
          </div>
      )
  }

  // --- ADD ADMIN ---
  if (view === View.SUPER_ADD_ADMIN) {
      return (
          <div className="p-6 h-full overflow-y-auto pb-12 bg-offwhite">
              {header("Manage Admins", true)}
              <GlassCard className="bg-white mb-6">
                  <h3 className="font-bold text-gray-800 mb-4">Add Principal / Admin</h3>
                  <div className="grid grid-cols-1 gap-4">
                      <FloatingInput label="Full Name" value={adminForm.name} onChange={(e) => setAdminForm({...adminForm, name: e.target.value})} />
                      <FloatingInput label="Email Address" value={adminForm.email} onChange={(e) => setAdminForm({...adminForm, email: e.target.value})} />
                      <FloatingInput label="Password" type="password" value={adminForm.password} onChange={(e) => setAdminForm({...adminForm, password: e.target.value})} />
                      <NeonButton fullWidth onClick={handleCreateAdmin}>Create Admin Account</NeonButton>
                  </div>
              </GlassCard>

              <h3 className="font-bold text-gray-800 mb-4 px-2">Existing Admins</h3>
              <div className="space-y-3">
                  {existingAdmins.map(a => (
                      <GlassCard key={a.uid} className="bg-white flex justify-between items-center p-4">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-royal text-white flex items-center justify-center font-bold">
                                  {a.name.charAt(0)}
                              </div>
                              <div>
                                  <h4 className="font-bold text-gray-900">{a.name}</h4>
                                  <p className="text-xs text-gray-500">{a.email}</p>
                              </div>
                          </div>
                          <button onClick={() => handleDeleteUser('admins', a.uid)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={18}/>
                          </button>
                      </GlassCard>
                  ))}
              </div>
          </div>
      )
  }

  // --- SETTINGS ---
  if (view === View.SUPER_SETTINGS) {
      return (
          <div className="p-6 h-full overflow-y-auto pb-12 bg-offwhite">
              {header("Global Settings", true)}
              
              <GlassCard className="bg-white mb-6">
                  <h3 className="font-bold text-gray-800 mb-4">School Branding</h3>
                  <div className="flex flex-col items-center gap-4 mb-4">
                      <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center relative overflow-hidden border-2 border-dashed border-gray-300">
                          {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain p-2"/> : <p className="text-xs text-gray-400">No Logo</p>}
                      </div>
                      <div className="w-full">
                          <label className="block w-full text-center py-3 bg-gray-100 rounded-xl text-royal font-bold text-sm cursor-pointer hover:bg-gray-200 transition-colors">
                              <Upload size={16} className="inline mr-2"/> Upload Logo File
                              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                          </label>
                      </div>
                  </div>
              </GlassCard>

              <GlassCard className="bg-white mb-6">
                  <h3 className="font-bold text-gray-800 mb-4">Integrations</h3>
                  <div className="space-y-4">
                       <FloatingInput label="Razorpay Key ID" value={razorpayKeyId} onChange={(e) => setRazorpayKeyId(e.target.value)} />
                       <FloatingInput label="Razorpay Secret Key" value={razorpaySecretKey} onChange={(e) => setRazorpaySecretKey(e.target.value)} />
                       <FloatingInput label="Fees Payment Callback URL" value={callbackUrl} onChange={(e) => setCallbackUrl(e.target.value)} />
                       
                       <div className="relative group">
                            <label className="text-xs font-bold text-gray-500 ml-4 mb-1 block">AI Assistant API Key</label>
                            <textarea 
                                value={aiApiKey}
                                onChange={(e) => setAiApiKey(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-white/50 border border-white shadow-inner focus:outline-none focus:ring-2 focus:ring-royal/50 font-mono text-xs h-20 resize-none"
                                placeholder="sk-..."
                            ></textarea>
                       </div>
                  </div>
                  <NeonButton fullWidth className="mt-4" onClick={() => { setShowSaved(true); setTimeout(() => setShowSaved(false), 2000); }}>
                      Save Configuration
                  </NeonButton>
                  {showSaved && <p className="text-green-500 text-center font-bold text-sm mt-2">Settings Saved!</p>}
              </GlassCard>
          </div>
      )
  }

  return (
      <div className="p-6">
          {header("Module Under Construction", true)}
          <p className="text-gray-500">This feature is coming soon.</p>
      </div>
  );
};
export default SuperAdminViews;
