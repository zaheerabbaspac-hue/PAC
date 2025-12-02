import React, { useState, useEffect, useRef } from 'react';
    import { motion } from 'framer-motion';
    import { View, ChatMessage } from '../types';
    import { GlassCard, NeonButton, SchoolLogo, FloatingInput } from '../components/Common';
    import { ChevronLeft, Send, Mic, MapPin, Phone, CreditCard, Download, User as UserIcon, QrCode, MessageCircle, Navigation, CalendarDays, FileText, CheckCircle2, Globe, Mail } from 'lucide-react';
    import { getAITutorResponse } from '../services/geminiService';
    import { User } from 'firebase/auth';

    interface Props {
      view: View;
      goBack: () => void;
      user: User | null;
    }

    export const UtilityViews: React.FC<Props> = ({ view, goBack, user }) => {
    
    // --- CHAT LOGIC ---
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', text: "Hello! I'm your AI Help Assistant. Ask me anything about your studies!", sender: 'ai', timestamp: new Date() }
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    
    // --- PROFILE CARD STATE ---
    const [isFlipped, setIsFlipped] = useState(false);

    // --- LEAVE APPLICATION STATE ---
    const [leaveForm, setLeaveForm] = useState({
        subject: '',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [leaveSubmitted, setLeaveSubmitted] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if(!inputText.trim()) return;
        const newMsg: ChatMessage = { id: Date.now().toString(), text: inputText, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, newMsg]);
        setInputText("");
        setIsTyping(true);

        const aiResponse = await getAITutorResponse(newMsg.text);
        
        setIsTyping(false);
        setMessages(prev => [...prev, { id: (Date.now()+1).toString(), text: aiResponse, sender: 'ai', timestamp: new Date() }]);
    };

    const handleLeaveSubmit = () => {
        // Mock submission
        setTimeout(() => {
            setLeaveSubmitted(true);
        }, 800);
    };

    const handleFeePayment = () => {
        alert("Redirecting to Payment Gateway...");
    };

    const header = (title: string, transparent = false) => (
        <div className={`flex items-center gap-4 mb-6 ${transparent ? 'absolute top-6 left-6 z-20 text-white' : ''}`}>
          <button onClick={goBack} className={`p-2 rounded-full shadow-md active:scale-90 transition-transform ${transparent ? 'bg-white/20 backdrop-blur-md' : 'bg-white text-gray-700'}`}>
            <ChevronLeft />
          </button>
          <h2 className={`text-2xl font-black ${transparent ? 'text-white' : 'text-gray-800'}`}>{title}</h2>
        </div>
    );

    /* --- CHAT VIEW --- */
    if (view === View.CHAT) {
        return (
            <div className="h-full flex flex-col bg-white relative">
                {/* Header - No Back Button, acts as main view */}
                <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
                    <div className="w-10 h-10 bg-royal/10 rounded-full flex items-center justify-center text-royal">
                        <MessageCircle size={24} />
                    </div>
                    <div className="flex-1">
                        <h2 className="font-bold text-lg text-gray-800">AI Help Assistant</h2>
                        <div className="flex items-center gap-1 text-xs text-green-500 font-medium">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> Online
                        </div>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 bg-offwhite space-y-4 pb-48 scroll-smooth">
                    {messages.map((msg) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            key={msg.id} 
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                msg.sender === 'user' 
                                ? 'bg-royal text-white rounded-br-none' 
                                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                            }`}>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-1 ml-4 items-center h-10">
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></div>
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></div>
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Floating Input Area - Positioned above Bottom Nav */}
                <div className="fixed bottom-[6.5rem] left-4 right-4 z-40">
                    <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-full shadow-xl shadow-royal/10 p-2 flex items-center gap-2">
                        <button className="p-3 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"><Mic size={20}/></button>
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your question..." 
                            className="flex-1 bg-transparent px-2 text-gray-800 placeholder-gray-400 focus:outline-none"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!inputText.trim()}
                            className="p-3 bg-gradient-to-r from-royal to-neon text-white rounded-full shadow-lg disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all">
                            <Send size={18}/>
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    /* --- LEAVE APPLICATION VIEW --- */
    if (view === View.LEAVE) {
        return (
            <div className="p-6 h-full overflow-y-auto pb-24 bg-gray-50">
                {header("Apply for Leave")}
                
                {leaveSubmitted ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center h-[60vh] text-center"
                    >
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-lg shadow-green-100">
                            <CheckCircle2 size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">Application Sent!</h3>
                        <p className="text-gray-500 max-w-xs mb-8">Your leave application has been successfully submitted to the class teacher for approval.</p>
                        <NeonButton onClick={() => {setLeaveSubmitted(false); setLeaveForm({subject: '', startDate: '', endDate: '', reason: ''}); goBack();}}>
                            Back to Dashboard
                        </NeonButton>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                         <p className="text-gray-500 mb-6">Submit a formal leave request to your class teacher.</p>
                         
                         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
                            <FloatingInput 
                                label="Subject" 
                                value={leaveForm.subject}
                                onChange={(e) => setLeaveForm({...leaveForm, subject: e.target.value})}
                                icon={<FileText size={18}/>}
                            />
                            
                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 ml-4 mb-1 block">From</label>
                                    <FloatingInput 
                                        label="" 
                                        type="date"
                                        value={leaveForm.startDate}
                                        onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                                        icon={<CalendarDays size={18}/>}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 ml-4 mb-1 block">To</label>
                                    <FloatingInput 
                                        label="" 
                                        type="date"
                                        value={leaveForm.endDate}
                                        onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                                        icon={<CalendarDays size={18}/>}
                                    />
                                </div>
                            </div>

                            <div className="relative group mb-6">
                                <label className="text-xs font-bold text-gray-500 ml-4 mb-1 block">Application Body</label>
                                <textarea
                                    className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-royal/50 focus:bg-white transition-all text-gray-800 resize-none h-40 shadow-inner"
                                    placeholder="Respected Teacher, I am writing to request leave due to..."
                                    value={leaveForm.reason}
                                    onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                                ></textarea>
                            </div>

                            <NeonButton fullWidth onClick={handleLeaveSubmit}>
                                Submit Application <Send size={18} className="ml-2"/>
                            </NeonButton>
                         </div>

                         <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 items-start">
                             <div className="mt-1 text-royal"><MessageCircle size={18} /></div>
                             <p className="text-xs text-blue-800 leading-relaxed">
                                 <strong>Note:</strong> Medical leaves for more than 2 days require a medical certificate to be uploaded or submitted to the admin office.
                             </p>
                         </div>
                    </motion.div>
                )}
            </div>
        );
    }

    /* --- FEES VIEW --- */
    if (view === View.FEES) {
        return (
            <div className="p-6 h-full overflow-y-auto pb-24 no-scrollbar">
                {header("Fees Payment")}
                <GlassCard className="mb-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white border-none h-48 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="flex justify-between items-start z-10">
                        <CreditCard className="text-gray-400" />
                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">Active</span>
                    </div>
                    <div className="z-10">
                        <p className="text-gray-400 text-xs mb-1">Total Due</p>
                        <h2 className="text-3xl font-black">$2,450.00</h2>
                        <p className="text-gray-500 text-xs mt-4">Due Date: 15 Nov 2023</p>
                    </div>
                </GlassCard>
                <NeonButton fullWidth variant="primary" className="mb-8" onClick={handleFeePayment}>Pay Now</NeonButton>
                
                <h3 className="font-bold text-gray-800 mb-4">Transaction History</h3>
                <div className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-royal flex items-center justify-center">
                                    <Download size={18} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">Tuition Fee - Term {i}</h4>
                                    <p className="text-xs text-gray-400">Paid on 12 Aug</p>
                                </div>
                            </div>
                            <span className="font-bold text-gray-800">$1,200</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    /* --- LOCATION VIEW (Replaced BUS) --- */
    if (view === View.LOCATION) {
        return (
            <div className="h-full relative bg-gray-50 flex flex-col">
                <div className="p-6">
                    {header("School Location")}
                </div>
                
                <div className="flex-1 flex flex-col items-center px-6">
                     <GlassCard className="w-full aspect-square relative overflow-hidden bg-gray-200 p-0 mb-6 group">
                        {/* Static placeholder map or image */}
                         <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.2090,28.6139,15,0,0/600x600?access_token=pk.mock')] bg-cover bg-center opacity-70 group-hover:scale-110 transition-transform duration-700"></div>
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                         <div className="absolute bottom-6 left-6 text-white">
                             <h3 className="text-2xl font-black mb-1">Presidency Academy</h3>
                             <p className="opacity-90 flex items-center gap-2"><MapPin size={16}/> Official Campus</p>
                         </div>
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                             <div className="w-4 h-4 bg-royal rounded-full animate-ping absolute inset-0"></div>
                             <div className="w-4 h-4 bg-royal rounded-full border-2 border-white relative z-10 shadow-lg"></div>
                         </div>
                     </GlassCard>

                     <div className="w-full space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm">
                            <div className="bg-royal/10 p-3 rounded-full text-royal">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Address</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    Presidency Academy Senior Secondary School<br/>
                                    Sector 14, Main Avenue<br/>
                                    New Delhi, 110001
                                </p>
                            </div>
                        </div>

                         <a 
                            href="https://maps.app.goo.gl/86uda9yLwpd9n8EX8" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block w-full"
                         >
                             <NeonButton fullWidth variant="primary">
                                 <Navigation size={20} className="mr-2"/> Get Directions
                             </NeonButton>
                         </a>
                     </div>
                </div>
            </div>
        )
    }

    /* --- CONTACT VIEW --- */
    if (view === View.CONTACT) {
        return (
            <div className="p-6 h-full overflow-y-auto pb-24 bg-gray-50">
                {header("Contact Us")}

                <div className="flex flex-col items-center mb-8">
                     <div className="w-24 h-24 mb-4">
                         <SchoolLogo />
                     </div>
                     <h3 className="text-xl font-black text-center text-gray-900">Presidency Academy<br/>Senior Secondary School</h3>
                     <p className="text-sm text-gray-500 mt-2 font-medium">Excellence in Education Since 1995</p>
                </div>

                <div className="space-y-4 mb-8">
                     {/* Phone */}
                     <GlassCard className="bg-white/80 flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                             <Phone size={24} />
                         </div>
                         <div className="flex-1">
                             <p className="text-xs text-gray-500 font-bold uppercase">Reception</p>
                             <p className="font-bold text-gray-900 text-lg">+91 98765 43210</p>
                         </div>
                         <a href="tel:+919876543210" className="p-3 bg-green-500 text-white rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-transform">
                             <Phone size={18} />
                         </a>
                     </GlassCard>

                     {/* Email */}
                     <GlassCard className="bg-white/80 flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                             <Mail size={24} />
                         </div>
                         <div className="flex-1">
                             <p className="text-xs text-gray-500 font-bold uppercase">Email Address</p>
                             <p className="font-bold text-gray-900 text-lg break-all">info@presidency.edu</p>
                         </div>
                         <a href="mailto:info@presidency.edu" className="p-3 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform">
                             <Mail size={18} />
                         </a>
                     </GlassCard>

                     {/* Website */}
                     <GlassCard className="bg-white/80 flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                             <Globe size={24} />
                         </div>
                         <div className="flex-1">
                             <p className="text-xs text-gray-500 font-bold uppercase">Website</p>
                             <p className="font-bold text-gray-900 text-lg">www.presidency.edu</p>
                         </div>
                         <a href="https://www.presidency.edu" target="_blank" rel="noreferrer" className="p-3 bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-transform">
                             <Globe size={18} />
                         </a>
                     </GlassCard>
                </div>
                
                <div className="bg-white p-6 rounded-3xl shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-4">Visit Us</h4>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                        Sector 14, Main Avenue<br/>
                        Near City Center Mall<br/>
                        New Delhi, 110001
                    </p>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">8:00 AM - 4:00 PM</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">Mon - Sat</span>
                    </div>
                </div>
            </div>
        );
    }

    /* --- PROFILE VIEW --- */
    if (view === View.PROFILE) {
        return (
            <div className="p-6 h-full overflow-y-auto pb-24 bg-gray-50 flex flex-col items-center">
                 {header("Student ID")}
                 <div className="w-full max-w-sm perspective-1000 cursor-pointer h-[450px]" onClick={() => setIsFlipped(!isFlipped)}>
                     <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                         {/* Front */}
                         <div className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-200">
                             <div className="h-32 bg-gradient-to-br from-royal to-neon relative">
                                 {/* ID Card Logo overlay */}
                                 <div className="absolute top-4 left-4 w-12 h-12 opacity-80 mix-blend-overlay">
                                     <SchoolLogo useWhite />
                                 </div>
                                 <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                                     <img src={user?.photoURL || "https://picsum.photos/300"} className="w-full h-full object-cover" />
                                 </div>
                             </div>
                             <div className="pt-20 text-center px-6">
                                 <h2 className="text-2xl font-black text-gray-900">{user?.displayName || "Student Name"}</h2>
                                 <p className="text-royal font-bold mb-4">Class XII - Science</p>
                                 <div className="grid grid-cols-2 gap-4 text-left mt-6 text-sm">
                                     <div>
                                         <p className="text-gray-400 text-xs">Roll No.</p>
                                         <p className="font-bold">24105</p>
                                     </div>
                                     <div>
                                         <p className="text-gray-400 text-xs">DOB</p>
                                         <p className="font-bold">12 Mar 2006</p>
                                     </div>
                                     <div>
                                         <p className="text-gray-400 text-xs">Blood Group</p>
                                         <p className="font-bold">O+</p>
                                     </div>
                                     <div>
                                         <p className="text-gray-400 text-xs">Email</p>
                                         <p className="font-bold truncate" title={user?.email || ""}>{user?.email || "N/A"}</p>
                                     </div>
                                 </div>
                             </div>
                             <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-400">Presidency Academy Senior Secondary</div>
                         </div>
                         
                         {/* Back */}
                         <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-8">
                             <h3 className="font-bold text-lg mb-6">Scan for Details</h3>
                             <div className="bg-white p-4 rounded-xl mb-6">
                                 <QrCode className="w-40 h-40 text-black" />
                             </div>
                             <p className="text-center text-sm text-gray-400">This card is property of Presidency Academy. If found, please return to school office.</p>
                         </div>
                     </div>
                 </div>
                 <p className="mt-8 text-gray-400 text-sm animate-pulse">Tap card to flip</p>
            </div>
        )
    }

    return (
        <div className="p-6 h-full flex flex-col items-center justify-center text-gray-400">
            {header("Coming Soon")}
            <p>This module is under construction.</p>
        </div>
    );
};
