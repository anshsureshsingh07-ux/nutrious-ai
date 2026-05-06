import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, LayoutDashboard, Utensils, Droplets, MessageSquare, Camera, User as UserIcon, Loader2, Plus, TrendingUp, History, Sparkles, Mail, Lock, CheckCircle } from 'lucide-react';
import { auth, UserProfile, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, googleProvider, signInWithPopup } from './lib/firebase';
import { signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { BackgroundBlobs } from './components/BackgroundBlobs';
import { cn } from './lib/utils';

// Pages
import Dashboard from './components/Dashboard';
import FoodScanner from './components/FoodScanner';
import ChatCoach from './components/ChatCoach';
import Profile from './components/Profile';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.emailVerified) {
          setUser(user);
          setPendingVerificationEmail(null);
          // Provide a default profile for now since we are not using Firestore
          setProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'User',
            photoURL: user.photoURL || '',
            calorieGoal: 2000,
            waterGoal: 2500,
            stepGoal: 10000
          });
        } else {
          // Block access and show verification screen
          setPendingVerificationEmail(user.email);
          await signOut(auth);
          setUser(null);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (cred.user) {
          await sendEmailVerification(cred.user);
          setPendingVerificationEmail(email);
          await signOut(auth);
        }
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (!cred.user.emailVerified) {
          setPendingVerificationEmail(email);
          await signOut(auth);
          setError(""); // Clear error if it was "wrong password" previously
        }
      }
    } catch (err: any) {
      if (isSignUp && err.code === 'auth/email-already-in-use') {
        setError("User already exists. Please sign in");
      } else if (!isSignUp && (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-email')) {
        setError("Email or password is incorrect");
      } else {
        setError("An error occurred. Please check your credentials.");
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Please check your inbox.");
      setError(""); 
    } catch (err: any) {
      setError("Could not send reset link. Ensure the email is correct.");
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google auth error:", err);
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setEmail('');
      setPassword('');
      setError('');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (pendingVerificationEmail) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center p-4">
        <BackgroundBlobs />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-md w-full text-center space-y-8 p-10"
        >
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-blue-500" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-white">Verify your email</h2>
            <p className="text-gray-400 leading-relaxed">
              We have sent you a verification email to <span className="text-white font-semibold">{pendingVerificationEmail}</span>. Please verify it and log in.
            </p>
          </div>
          <button 
            onClick={() => {
              setPendingVerificationEmail(null);
              setIsSignUp(false);
              setEmail('');
              setPassword('');
              setError('');
            }}
            className="w-full bg-white text-black py-4 rounded-2xl font-semibold hover:bg-opacity-90 transition-all"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center p-4">
        <BackgroundBlobs />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-md w-full text-center space-y-8 p-10"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
              Nutrious AI
            </h1>
            <p className="text-gray-400">Authenticating into your personal assistant.</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
                  required
                />
              </div>
              {!isSignUp && (
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-xs text-indigo-400 hover:text-indigo-300 text-right w-full mt-1 transition-colors block"
                >
                  Forgot Password?
                </button>
              )}
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-red-400 text-sm font-medium px-1 bg-red-400/10 py-2 rounded-lg text-center"
              >
                {error}
              </motion.p>
            )}

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-semibold hover:bg-opacity-90 transition-all group mt-6"
            >
              {isSignUp ? "Create Account" : "Sign In"}
              <motion.span 
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </button>
          </form>

          <div className="flex items-center gap-4 my-2">
            <div className="flex-1 h-[1px] bg-white/10"></div>
            <span className="text-xs text-gray-500 font-medium">OR</span>
            <div className="flex-1 h-[1px] bg-white/10"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-semibold hover:bg-white/10 transition-all group"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="space-y-4">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
            <p className="text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative flex flex-col">
      <BackgroundBlobs />
      
      {/* Header */}
      <header className="p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-display font-bold">Nutrious <span className="text-sky-400">x Horimiya</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 glass p-1.5 pr-4 rounded-full hover:bg-white/10 transition-all"
          >
            <img 
              src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile?.uid} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full border border-white/20" 
            />
            <span className="text-sm font-medium hidden sm:inline">{profile?.displayName?.split(' ')[0]}</span>
          </button>
          <button 
            onClick={handleLogout}
            className="p-2.5 glass rounded-full hover:bg-white/10 transition-all text-gray-400 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto py-8"
            >
              <Dashboard user={user} profile={profile!} />
            </motion.div>
          )}
          {activeTab === 'scanner' && (
            <motion.div 
              key="scanner"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto py-8"
            >
              <FoodScanner user={user} />
            </motion.div>
          )}
          {activeTab === 'coach' && (
            <motion.div 
              key="coach"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto py-8 h-full"
            >
              <ChatCoach user={user} />
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto py-8"
            >
              <Profile user={user} profile={profile!} onUpdate={(p) => setProfile(p)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 px-4 w-full flex justify-center">
        <div className="glass px-6 py-4 rounded-3xl flex items-center gap-8 md:gap-12 shadow-2xl">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutDashboard className="w-6 h-6" />} 
            label="Dashboard" 
          />
          <NavButton 
            active={activeTab === 'scanner'} 
            onClick={() => setActiveTab('scanner')} 
            icon={<Camera className="w-6 h-6" />} 
            label="Scan" 
          />
          <NavButton 
            active={activeTab === 'coach'} 
            onClick={() => setActiveTab('coach')} 
            icon={<MessageSquare className="w-6 h-6" />} 
            label="Coach" 
          />
          <NavButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            icon={<UserIcon className="w-6 h-6" />} 
            label="Profile" 
          />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-indigo-400 scale-110" : "text-gray-400 hover:text-gray-200"
      )}
    >
      <div className="relative">
        {icon}
        {active && (
          <motion.div 
            layoutId="nav-dot"
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400"
          />
        )}
      </div>
      <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
    </button>
  );
}
