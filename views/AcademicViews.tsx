
import React from 'react';
import { motion } from 'framer-motion';
import { View } from '../types';
import { GlassCard, SectionHeader, NeonButton } from '../components/Common';
import { ChevronLeft, UploadCloud, Check, FileText, Clock, Download, Image as ImageIcon, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Props {
  view: View;
  goBack: () => void;
}

const mockAttendanceData = [
  { day: 'Mon', present: 1 },
  { day: 'Tue', present: 1 },
  { day: 'Wed', present: 0.5 },
  { day: 'Thu', present: 1 },
  { day: 'Fri', present: 1 },
  { day: 'Sat', present: 0 },
];

const mockResultData = [
  { subject: 'Math', A: 120, fullMark: 150 },
  { subject: 'Phys', A: 98, fullMark: 150 },
  { subject: 'Chem', A: 86, fullMark: 150 },
  { subject: 'Eng', A: 99, fullMark: 150 },
  { subject: 'Comp', A: 85, fullMark: 150 },
  { subject: 'Bio', A: 65, fullMark: 150 },
];

const mockMaterials = [
    { id: 1, title: "Chapter 4: Thermodynamics Notes", subject: "Physics", teacher: "Mr. Sharma", type: "pdf", date: "Today" },
    { id: 2, title: "Organic Chemistry Reactions Chart", subject: "Chemistry", teacher: "Mrs. Verma", type: "image", date: "Yesterday" },
    { id: 3, title: "Calculus Formula Sheet", subject: "Mathematics", teacher: "Mr. Gupta", type: "pdf", date: "22 Oct" },
    { id: 4, title: "English Poem Summary", subject: "English", teacher: "Ms. Das", type: "pdf", date: "20 Oct" },
];

const mockExams = [
    { date: "15 Nov", time: "09:00 AM - 12:00 PM", subject: "Physics (Theory)", code: "PHY-042", status: "Upcoming" },
    { date: "18 Nov", time: "09:00 AM - 12:00 PM", subject: "Mathematics", code: "MAT-041", status: "Upcoming" },
    { date: "20 Nov", time: "09:00 AM - 12:00 PM", subject: "Chemistry (Theory)", code: "CHE-043", status: "Upcoming" },
    { date: "22 Nov", time: "09:00 AM - 12:00 PM", subject: "English Core", code: "ENG-301", status: "Upcoming" },
    { date: "25 Nov", time: "09:00 AM - 12:00 PM", subject: "Computer Science", code: "CS-083", status: "Upcoming" },
];

export const AcademicViews: React.FC<Props> = ({ view, goBack }) => {
  const header = (title: string) => (
    <div className="flex items-center gap-4 mb-6">
      <button onClick={goBack} className="p-2 rounded-full bg-white shadow-md text-gray-700 active:scale-90 transition-transform">
        <ChevronLeft />
      </button>
      <h2 className="text-2xl font-black text-gray-800">{title}</h2>
    </div>
  );

  const handleDownload = (title: string) => {
      alert(`Downloading ${title}...`);
  };

  const handleUpload = () => {
      alert("Opening file picker...");
  };

  /* --- ATTENDANCE VIEW --- */
  if (view === View.ATTENDANCE) {
    return (
      <div className="p-6 h-full overflow-y-auto pb-24 no-scrollbar">
        {header("Attendance")}
        <GlassCard className="mb-6 bg-gradient-to-r from-royal to-blue-600 text-white border-none">
           <div className="flex justify-between items-end">
             <div>
               <p className="text-blue-200 text-sm font-medium">October 2023</p>
               <h3 className="text-4xl font-black mt-2">24<span className="text-xl font-normal text-blue-200">/26 Days</span></h3>
             </div>
             <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                <span className="font-bold">92.3%</span>
             </div>
           </div>
        </GlassCard>

        <SectionHeader title="Weekly Overview" />
        <div className="h-64 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockAttendanceData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="present" fill="#3A4CFF" radius={[10, 10, 10, 10]} barSize={12} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <SectionHeader title="History" />
        <div className="grid grid-cols-7 gap-2">
            {Array.from({length: 31}).map((_, i) => (
                <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold 
                    ${i === 12 || i === 20 ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'}`}>
                    {i + 1}
                </div>
            ))}
        </div>
      </div>
    );
  }

  /* --- HOMEWORK VIEW --- */
  if (view === View.HOMEWORK) {
    return (
      <div className="p-6 h-full overflow-y-auto pb-24 no-scrollbar">
        {header("Homework")}
        <div className="flex gap-4 mb-6 overflow-x-auto no-scrollbar pb-2">
            <button className="px-6 py-2 rounded-full bg-royal text-white font-bold shadow-lg shadow-royal/30 whitespace-nowrap">Pending (3)</button>
            <button className="px-6 py-2 rounded-full bg-white text-gray-500 font-bold shadow-sm whitespace-nowrap">Completed</button>
        </div>

        {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="mb-4 bg-white/80" delay={i * 0.1}>
                <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-red-100 text-red-500 text-xs font-bold rounded-full">Due Tomorrow</span>
                    <span className="text-gray-400 text-xs font-bold">Physics</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Thermodynamics Worksheet</h3>
                <p className="text-sm text-gray-500 mb-4">Complete questions 1-15 from Chapter 4. Ensure diagrams are drawn.</p>
                <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                    <button className="flex items-center gap-2 text-gray-400 text-sm hover:text-royal transition-colors" onClick={() => handleDownload("Worksheet PDF")}>
                        <FileText size={16} /> View PDF
                    </button>
                    <button className="flex items-center gap-2 text-royal font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors" onClick={handleUpload}>
                        <UploadCloud size={16} /> Upload
                    </button>
                </div>
            </GlassCard>
        ))}
      </div>
    );
  }

  /* --- TIMETABLE VIEW --- */
  if (view === View.TIMETABLE) {
      const periods = [
          { time: "08:30 - 09:15", sub: "Mathematics", room: "302", active: false },
          { time: "09:15 - 10:00", sub: "Physics", room: "Lab A", active: true },
          { time: "10:00 - 10:45", sub: "Chemistry", room: "302", active: false },
          { time: "10:45 - 11:15", sub: "Break", room: "Canteen", active: false, break: true },
          { time: "11:15 - 12:00", sub: "English", room: "302", active: false },
          { time: "12:00 - 12:45", sub: "Computer Sci", room: "Lab 2", active: false },
      ];
      return (
        <div className="p-6 h-full overflow-y-auto pb-24 no-scrollbar">
            {header("Timetable")}
            <div className="flex justify-between items-center mb-6 bg-white p-2 rounded-xl shadow-sm">
                <button className="w-8 h-8 flex items-center justify-center text-gray-400"><ChevronLeft size={20}/></button>
                <span className="font-bold text-royal">Wednesday, Oct 24</span>
                <button className="w-8 h-8 flex items-center justify-center text-gray-400"><ChevronLeft size={20} className="rotate-180"/></button>
            </div>

            <div className="space-y-4">
                {periods.map((p, i) => (
                    <motion.div 
                        initial={{x: -20, opacity: 0}}
                        animate={{x: 0, opacity: 1}}
                        transition={{delay: i * 0.1}}
                        key={i} 
                        className={`relative flex gap-4 ${p.active ? 'scale-105' : 'opacity-80'}`}
                    >
                        <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${p.active ? 'bg-royal shadow-[0_0_10px_#3A4CFF]' : 'bg-gray-300'}`} />
                            {i !== periods.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-1" />}
                        </div>
                        <div className={`flex-1 p-4 rounded-2xl ${p.active ? 'bg-gradient-to-r from-royal to-blue-600 text-white shadow-lg shadow-royal/30' : 'bg-white shadow-sm'}`}>
                            <div className="flex justify-between mb-1">
                                <span className={`text-xs font-bold ${p.active ? 'text-blue-200' : 'text-gray-400'}`}>{p.time}</span>
                                {p.active && <span className="text-xs bg-white/20 px-2 rounded text-white animate-pulse">Now</span>}
                            </div>
                            <h4 className={`text-lg font-bold ${p.active ? 'text-white' : 'text-gray-800'}`}>{p.sub}</h4>
                            {!p.break && <div className={`flex items-center gap-1 text-sm mt-1 ${p.active ? 'text-blue-100' : 'text-gray-500'}`}>
                                <MapPinIcon /> Room {p.room}
                            </div>}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      );
  }

  /* --- EXAM SCHEDULE VIEW --- */
  if (view === View.EXAM_SCHEDULE) {
    return (
        <div className="p-6 h-full overflow-y-auto pb-24 no-scrollbar">
            {header("Exam Schedule")}
            
            <GlassCard className="mb-6 bg-gradient-to-br from-orange-500 to-red-500 text-white border-none">
                 <div className="flex items-start justify-between">
                     <div>
                         <p className="text-orange-100 font-bold mb-1">Upcoming Exams</p>
                         <h3 className="text-2xl font-black">Mid-Term Finals</h3>
                         <p className="text-sm text-orange-100 mt-2">Starts in 12 Days</p>
                     </div>
                     <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                         <Calendar size={32} />
                     </div>
                 </div>
            </GlassCard>

            <div className="flex justify-between items-center mb-4">
                <SectionHeader title="Datesheet" />
                <button onClick={() => handleDownload("Mid-Term Date Sheet")} className="flex items-center gap-2 text-royal font-bold text-sm bg-royal/10 px-3 py-1 rounded-full hover:bg-royal hover:text-white transition-colors">
                    <Download size={14}/> Download PDF
                </button>
            </div>

            <div className="space-y-4">
                {mockExams.map((exam, i) => (
                    <motion.div 
                        initial={{x: -20, opacity: 0}}
                        animate={{x: 0, opacity: 1}}
                        transition={{delay: i * 0.1}}
                        key={i} 
                    >
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center border border-gray-100">
                                    <span className="text-xs font-bold text-gray-400 uppercase">{exam.date.split(' ')[1]}</span>
                                    <span className="text-lg font-black text-gray-800">{exam.date.split(' ')[0]}</span>
                                </div>
                                {i !== mockExams.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-2" />}
                            </div>
                            <div className="flex-1 pb-4">
                                <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-royal">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-gray-800">{exam.subject}</h4>
                                        <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full">{exam.status}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                        <span className="flex items-center gap-1"><Clock size={12}/> {exam.time}</span>
                                        <span className="flex items-center gap-1"><FileText size={12}/> Code: {exam.code}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
  }

  /* --- MATERIALS VIEW --- */
  if (view === View.MATERIALS) {
    return (
        <div className="p-6 h-full overflow-y-auto pb-24 no-scrollbar">
            {header("Study Materials")}
            <p className="text-gray-500 mb-6">Files uploaded by your teachers for Class XII - A.</p>
            
            <div className="space-y-4">
                {mockMaterials.map((item, i) => (
                    <GlassCard key={item.id} className="bg-white/80" delay={i * 0.1}>
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                                item.subject === 'Physics' ? 'bg-blue-100 text-blue-600' :
                                item.subject === 'Chemistry' ? 'bg-purple-100 text-purple-600' :
                                item.subject === 'Mathematics' ? 'bg-orange-100 text-orange-600' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {item.subject}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">{item.date}</span>
                        </div>
                        
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl flex items-center justify-center ${
                                item.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                            }`}>
                                {item.type === 'pdf' ? <FileText size={24} /> : <ImageIcon size={24} />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800 leading-tight mb-1">{item.title}</h4>
                                <p className="text-xs text-gray-500">Uploaded by <span className="font-semibold text-royal">{item.teacher}</span></p>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-royal hover:text-white rounded-lg text-xs font-bold transition-colors" onClick={() => handleDownload(item.title)}>
                                <Download size={14} /> Download
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
  }

    /* --- RESULTS VIEW --- */
    if (view === View.RESULTS) {
        return (
            <div className="p-6 h-full overflow-y-auto pb-24 no-scrollbar">
                {header("Academic Results")}
                
                <GlassCard className="mb-6 bg-gradient-to-br from-neon to-purple-600 text-white border-none">
                     <div className="flex justify-between items-center">
                        <div>
                            <p className="text-purple-200">CGPA</p>
                            <h2 className="text-5xl font-black">9.4</h2>
                        </div>
                        <div className="text-right">
                             <div className="text-3xl font-black mb-1">A+</div>
                             <p className="text-purple-200 text-sm">Overall Grade</p>
                        </div>
                     </div>
                </GlassCard>

                <SectionHeader title="Performance Analysis" />
                <div className="h-64 w-full bg-white rounded-3xl p-2 mb-6 shadow-sm">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockResultData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar name="Student" dataKey="A" stroke="#B043FF" strokeWidth={3} fill="#B043FF" fillOpacity={0.3} />
                        <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                     {mockResultData.map((res, i) => (
                         <div key={i} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-offwhite flex items-center justify-center font-bold text-gray-600">
                                     {res.subject.substring(0,2)}
                                 </div>
                                 <span className="font-bold text-gray-800">{res.subject}</span>
                             </div>
                             <div className="text-right">
                                 <span className="font-bold text-royal">{res.A}</span>
                                 <span className="text-gray-400 text-xs">/150</span>
                             </div>
                         </div>
                     ))}
                </div>
            </div>
        );
    }

  return null;
};

// Helper icon
const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
)
