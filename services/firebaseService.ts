
import { auth, db, isFirebaseConfigured, firebaseConfig } from './firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut,
  getAuth
} from "firebase/auth";
import { initializeApp, getApp, getApps, deleteApp } from "firebase/app";
import { ref, set, get, child, onValue, remove, update, push } from "firebase/database";

export interface UserProfile {
  uid: string;
  name: string;
  email: string | null;
  role: 'student' | 'parent' | 'teacher' | 'admin' | 'superadmin';
  createdAt: number;
  class?: string;
  section?: string;
  status?: 'pending' | 'approved' | 'rejected';
  access?: string;
  parentName?: string;
  subject?: string;
  password?: string;
}

// --- AUTHENTICATION SERVICES ---

export const loginUser = async (email: string, password: string) => {
  if (!isFirebaseConfigured()) throw new Error("Please configure Firebase in services/firebaseConfig.ts");
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw error;
  }
};

export const registerUser = async (email: string, password: string, name: string, role: 'student' | 'parent' | 'teacher' | 'admin' | 'superadmin', additionalData?: any) => {
  if (!isFirebaseConfigured()) throw new Error("Please configure Firebase");
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (user) {
        await updateProfile(user, { displayName: name });

        const userData: UserProfile = {
          uid: user.uid,
          name: name,
          email: user.email,
          role: role,
          createdAt: Date.now(),
          status: 'approved',
          password: password,
          ...additionalData
        };

        // Save to global users path
        await saveUserProfile(user.uid, userData);
        
        let collection = '';
        if (role === 'admin') collection = 'admins';
        else if (role === 'teacher') collection = 'teachers';
        else if (role === 'student') collection = 'students';
        
        if (collection) {
            await set(ref(db, `${collection}/${user.uid}`), userData);
        }
    }
    return user;
  } catch (error: any) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

// --- SYSTEM USER CREATION (SUPER ADMIN ONLY) ---
export const createSystemUser = async (email: string, password: string, data: Partial<UserProfile>) => {
    if (!isFirebaseConfigured()) throw new Error("Firebase not configured");
    
    let secondaryApp;
    const appName = "SecondaryApp";
    try { secondaryApp = getApp(appName); } 
    catch { secondaryApp = initializeApp(firebaseConfig, appName); }
    const secondaryAuth = getAuth(secondaryApp);

    try {
        const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const newUser = userCred.user;
        
        if (newUser) {
            const fullData: UserProfile = {
                uid: newUser.uid,
                name: data.name || "System User",
                email: email,
                role: data.role as any,
                createdAt: Date.now(),
                status: 'approved',
                password: password,
                ...data
            };

            await set(ref(db, `users/${newUser.uid}`), fullData);

            let collection = '';
            if (data.role === 'admin') collection = 'admins';
            else if (data.role === 'teacher') collection = 'teachers';
            else if (data.role === 'student') collection = 'students';
            
            if (collection) {
                await set(ref(db, `${collection}/${newUser.uid}`), fullData);
            }
        }
        await signOut(secondaryAuth);
        return newUser;
    } catch (error) {
        throw error;
    }
};

// --- DATABASE SERVICES ---

export const saveUserProfile = async (uid: string, data: UserProfile) => {
  try {
    const userRef = ref(db, 'users/' + uid);
    await set(userRef, data);
  } catch (error) {
    console.error("Error saving profile:", error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users/${uid}`));
    if (snapshot.exists()) {
      return snapshot.val() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

export const getUserRole = async (uid: string): Promise<string | null> => {
    const profile = await getUserProfile(uid);
    return profile ? profile.role : null;
};

// --- REAL-TIME LISTENERS ---

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
    const collectionRef = ref(db, collectionName);
    return onValue(collectionRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const list = Object.keys(data).map(key => ({ ...data[key], uid: key }));
            callback(list);
        } else {
            callback([]);
        }
    });
};

export const updateUserStatus = async (collection: string, uid: string, status: 'approved' | 'rejected') => {
    const updates: any = {};
    updates[`/${collection}/${uid}/status`] = status;
    updates[`/users/${uid}/status`] = status;
    await update(ref(db), updates);
};

export const deleteUserRecord = async (collection: string, uid: string) => {
    const updates: any = {};
    updates[`/${collection}/${uid}`] = null;
    updates[`/users/${uid}`] = null;
    await update(ref(db), updates);
};

// --- GLOBAL SETTINGS (LOGO) ---

export const saveSchoolLogo = async (base64Data: string) => {
  try {
    await set(ref(db, 'settings/schoolLogo'), base64Data);
  } catch (error) {
    console.error("Error saving logo:", error);
    throw error;
  }
};

export const subscribeToSchoolLogo = (callback: (url: string | null) => void) => {
  const logoRef = ref(db, 'settings/schoolLogo');
  return onValue(logoRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || null);
  });
};

// --- CLASS & SECTION MANAGEMENT ---

export const addClass = async (className: string, classCode: string) => {
  const classesRef = ref(db, 'classes');
  const newClassRef = push(classesRef);
  await set(newClassRef, {
    id: newClassRef.key,
    name: className,
    code: classCode,
    sections: {}
  });
};

export const addSection = async (classId: string, sectionName: string, sectionCode: string) => {
  const sectionsRef = ref(db, `classes/${classId}/sections`);
  const newSectionRef = push(sectionsRef);
  await set(newSectionRef, {
    id: newSectionRef.key,
    name: sectionName,
    code: sectionCode
  });
};

export const deleteClass = async (classId: string) => {
  await remove(ref(db, `classes/${classId}`));
};

export const deleteSection = async (classId: string, sectionId: string) => {
  await remove(ref(db, `classes/${classId}/sections/${sectionId}`));
};

export const subscribeToClasses = (callback: (data: any[]) => void) => {
  const classesRef = ref(db, 'classes');
  return onValue(classesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const list = Object.keys(data).map(key => {
        const sectionsObj = data[key].sections || {};
        const sectionsList = Object.keys(sectionsObj).map(sectKey => ({
          ...sectionsObj[sectKey],
          id: sectKey
        }));
        return { 
          ...data[key], 
          id: key,
          sections: sectionsList
        };
      });
      callback(list);
    } else {
      callback([]);
    }
  });
};

export const formatClassOptions = (classesList: any[]) => {
    const options: {label: string, value: string, className: string, section: string}[] = [];
    if (classesList && classesList.length > 0) {
        classesList.forEach((c: any) => {
            if (c.sections && Array.isArray(c.sections) && c.sections.length > 0) {
                c.sections.forEach((s: any) => {
                    options.push({
                        label: `${c.name} - Sec ${s.name}`, 
                        value: `${c.name}-${s.name}`,
                        className: c.name,
                        section: s.name
                    });
                });
            } else {
                options.push({
                    label: c.name,
                    value: c.name,
                    className: c.name,
                    section: ''
                });
            }
        });
    }
    return options;
};

// --- TEACHER SERVICES ---

export const markAttendance = async (classId: string, date: string, attendanceData: any) => {
    const path = `attendance/${classId}/${date}`;
    await set(ref(db, path), attendanceData);
};

export const createHomework = async (classId: string, homeworkData: any) => {
    const path = `homework/${classId}`;
    const newRef = push(ref(db, path));
    await set(newRef, { ...homeworkData, createdAt: Date.now(), id: newRef.key });
};

export const publishNotice = async (noticeData: any) => {
    const newRef = push(ref(db, 'notices'));
    await set(newRef, { ...noticeData, createdAt: Date.now(), id: newRef.key });
};
