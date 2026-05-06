import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, updateProfile, GoogleAuthProvider, signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDgwwo97BE6Jdu5lJFamkZfhdFCGaS0iFU",
  authDomain: "nutrious-ai.firebaseapp.com",
  projectId: "nutrious-ai",
  storageBucket: "nutrious-ai.firebasestorage.app",
  messagingSenderId: "748422581041",
  appId: "1:748422581041:web:d5d35544a712149cc63e10",
  measurementId: "G-XYFTXWEMNT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, updateProfile, signInWithPopup };

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  calorieGoal: number;
  waterGoal: number;
  stepGoal: number;
}
