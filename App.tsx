import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { View } from './types';
import { SplashScreen, Onboarding, Auth } from './views/OnboardingAuth';
import Dashboard from './views/Dashboard';
import { AcademicViews } from './views/AcademicViews';
import { UtilityViews } from './views/UtilityViews';
import SuperAdminViews from './views/SuperAdminViews';
import AdminViews from './views/AdminViews';
import TeacherViews from './views/TeacherViews';
import ParentViews from './views/ParentViews';
import { Home, Calendar, MessageCircle, User as UserIcon, Loader2, Book, CheckCircle, Bell, CreditCard } from 'lucide-react';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getUserProfile } from './services/firebaseService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.SPLASH);
  const [user, setUser] = useState<User | null>(null);
  const [appLoading, setAppLoading] = useState(true);

  // --- REFS TO TRACK STATE IN LISTENERS ---
  const currentViewRef = useRef(currentView);

  // Keep ref synced with state
  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  // --- PERSISTENT SESSION & ROLE CHECK ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // If user is logged in, fetch role to determine view
        try {
            const profile = await getUserProfile(currentUser.uid);
            
            // Only redirect if currently on Auth/Splash/Onboarding
            // Use ref to check current view to avoid stale closures
            const viewNow = currentViewRef.current;
            const isPublicView = [View.SPLASH, View.ONBOARDING, View.AUTH].includes(viewNow);
            
            if (profile) {
                if (profile.role === 'superadmin') {
                     setCurrentView(View.SUPER_DASHBOARD);
                } else if (profile.role === 'admin') {
                     setCurrentView(View.ADMIN_DASHBOARD);
                } else if (profile.role === 'teacher') {
                     setCurrentView(View.TEACHER_DASHBOARD);
                } else if (profile.role === 'parent') {
                     setCurrentView(View.PARENT_DASHBOARD);
                } else if (profile.role === 'student') {
                     // If on public view, go to dashboard. If already deep in app, stay there (unless role mismatch)
                     if (isPublicView) setCurrentView(View.DASHBOARD);
                }
            } else {
                // Profile missing? Go to dashboard as fallback
                if (isPublicView) setCurrentView(View.DASHBOARD);
            }
        } catch (e) {
            console.error("Error fetching profile on reload", e);
        }
      } else {
        // User is logged out
        // Use ref to check current view
        const viewNow = currentViewRef.current;
        if (viewNow !== View.SPLASH && viewNow !== View.ONBOARDING) {
            setCurrentView(View.AUTH);
        }
      }
      setAppLoading(false);
    });
    return () => unsubscribe();
  }, []); // Run once on mount

  // Determine if we should hide the student bottom navigation
  const isFullScreen = [View.SPLASH, View.ONBOARDING, View.AUTH].includes(currentView);
  const isSuperAdminView = currentView.startsWith('SUPER_');
  const isAdminView = currentView.startsWith('ADMIN_');
  const isTeacherView = currentView.startsWith('TEACHER_');
  const isParentView = currentView.startsWith('PARENT_');

  const BottomNav = () => (
    <div className="fixed bottom-6 left-6 right-6 h-16 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl shadow-royal/10 flex justify-around items-center px-2 z-50 border border-white/50">
        {[
            { v: View.DASHBOARD, i: <Home />, l: 'Home' },
            { v: View.TIMETABLE, i: <Calendar />, l: 'Schedule' },
            { v: View.CHAT, i: <MessageCircle />, l: 'Chat' },
            { v: View.PROFILE, i: <UserIcon />, l: 'Profile' }
        ].map((item) => (
            <button 
                key={item.v}
                onClick={() => setCurrentView(item.v)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === item.v ? 'text-royal -translate-y-4 bg-white shadow-lg shadow-royal/20' : 'text-gray-400 hover:text-royal/60'}`}
            >
                {item.i}
            </button>
        ))}
    </div>
  );

  const TeacherBottomNav = () => (
    <div className="fixed bottom-6 left-6 right-6 h-16 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl shadow-neon/10 flex justify-around items-center px-2 z-50 border border-white/50">
        {[
            { v: View.TEACHER_DASHBOARD, i: <Home />, l: 'Home' },
            { v: View.TEACHER_ATTENDANCE, i: <CheckCircle />, l: 'Attendance' },
            { v: View.TEACHER_HOMEWORK, i: <Book />, l: 'Homework' },
            { v: View.TEACHER_NOTICES, i: <Bell />, l: 'Notices' },
            { v: View.TEACHER_PROFILE, i: <UserIcon />, l: 'Profile' }
        ].map((item) => (
            <button 
                key={item.v}
                onClick={() => setCurrentView(item.v)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === item.v ? 'text-neon -translate-y-4 bg-white shadow-lg shadow-neon/20' : 'text-gray-400 hover:text-neon/60'}`}
            >
                {item.i}
            </button>
        ))}
    </div>
  );

  const ParentBottomNav = () => (
    <div className="fixed bottom-6 left-6 right-6 h-16 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl shadow-royal/10 flex justify-around items-center px-2 z-50 border border-white/50">
        {[
            { v: View.PARENT_DASHBOARD, i: <Home />, l: 'Home' },
            { v: View.PARENT_FEES, i: <CreditCard />, l: 'Fees' },
            { v: View.PARENT_CHAT, i: <MessageCircle />, l: 'Chat' },
            { v: View.PARENT_PROFILE, i: <UserIcon />, l: 'Profile' }
        ].map((item) => (
            <button 
                key={item.v}
                onClick={() => setCurrentView(item.v)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === item.v ? 'text-royal -translate-y-4 bg-white shadow-lg shadow-royal/20' : 'text-gray-400 hover:text-royal/60'}`}
            >
                {item.i}
            </button>
        ))}
    </div>
  );

  const renderView = () => {
    switch (currentView) {
      case View.SPLASH: return <SplashScreen changeView={setCurrentView} />;
      case View.ONBOARDING: return <Onboarding changeView={setCurrentView} />;
      case View.AUTH: return <Auth changeView={setCurrentView} />;
      case View.DASHBOARD: return <Dashboard changeView={setCurrentView} user={user} />;
      
      // Academic Views
      case View.ATTENDANCE:
      case View.HOMEWORK:
      case View.TIMETABLE:
      case View.RESULTS:
      case View.MATERIALS:
      case View.EXAM_SCHEDULE:
        return <AcademicViews view={currentView} goBack={() => setCurrentView(View.DASHBOARD)} />;
      
      // Utility Views
      case View.FEES:
      case View.NOTICES:
      case View.LOCATION:
      case View.GALLERY:
      case View.CHAT:
      case View.PROFILE:
      case View.LEAVE:
      case View.CONTACT:
        return <UtilityViews view={currentView} goBack={() => setCurrentView(View.DASHBOARD)} user={user} />;
      
      // Super Admin Views
      case View.SUPER_DASHBOARD:
      case View.SUPER_SETTINGS:
      case View.SUPER_ADD_ADMIN:
      case View.SUPER_ADD_TEACHER:
      case View.SUPER_CLASSES:
      case View.SUPER_APPROVE:
      case View.SUPER_ANALYTICS:
      case View.SUPER_NOTIFICATIONS:
      case View.SUPER_LOGS:
        return <SuperAdminViews view={currentView} changeView={setCurrentView} />;

      // Admin (Principal) Views
      case View.ADMIN_DASHBOARD:
      case View.ADMIN_ATTENDANCE:
      case View.ADMIN_LEAVES:
      case View.ADMIN_TEACHERS:
      case View.ADMIN_STUDENTS:
      case View.ADMIN_TIMETABLE:
      case View.ADMIN_RESULTS:
      case View.ADMIN_FEES:
      case View.ADMIN_NOTICES:
      case View.ADMIN_GALLERY:
      case View.ADMIN_CHAT:
      case View.ADMIN_PROFILE:
        return <AdminViews view={currentView} changeView={setCurrentView} />;

      // Teacher Views
      case View.TEACHER_DASHBOARD:
      case View.TEACHER_ATTENDANCE:
      case View.TEACHER_HOMEWORK:
      case View.TEACHER_NOTICES:
      case View.TEACHER_STUDENTS:
      case View.TEACHER_PROFILE:
        return <TeacherViews view={currentView} changeView={setCurrentView} user={user} />;

      // Parent Views
      case View.PARENT_DASHBOARD:
      case View.PARENT_ATTENDANCE:
      case View.PARENT_HOMEWORK:
      case View.PARENT_TIMETABLE:
      case View.PARENT_EXAM_SCHEDULE:
      case View.PARENT_RESULTS:
      case View.PARENT_FEES:
      case View.PARENT_NOTICES:
      case View.PARENT_GALLERY:
      case View.PARENT_BUS:
      case View.PARENT_CHAT:
      case View.PARENT_PROFILE:
        return <ParentViews view={currentView} changeView={setCurrentView} user={user} />;

      default: return <Dashboard changeView={setCurrentView} user={user} />;
    }
  };

  if (appLoading && currentView !== View.SPLASH) {
      return (
          <div className="w-full h-screen flex items-center justify-center bg-offwhite">
              <Loader2 className="animate-spin text-royal w-12 h-12" />
          </div>
      );
  }

  return (
    <div className="relative w-full h-screen bg-offwhite overflow-hidden font-sans text-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
      
      {/* Student Nav */}
      {!isFullScreen && !isSuperAdminView && !isAdminView && !isTeacherView && !isParentView && <BottomNav />}
      
      {/* Teacher Nav */}
      {isTeacherView && <TeacherBottomNav />}

      {/* Parent Nav */}
      {isParentView && <ParentBottomNav />}
    </div>
  );
};

export default App;