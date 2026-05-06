import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Target, Droplets, Footprints, Save, Loader2, Check, Edit2, Camera, X, Sparkles } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserProfile, auth, updateProfile, storage } from '../lib/firebase';
import { cn } from '../lib/utils';

interface ProfileProps {
  user: any;
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

export default function Profile({ user, profile, onUpdate }: ProfileProps) {
  const [formData, setFormData] = useState<UserProfile>(profile || {
    uid: user?.uid || '',
    email: user?.email || '',
    displayName: user?.displayName || 'User',
    photoURL: user?.photoURL || '',
    calorieGoal: 2000,
    waterGoal: 2500,
    stepGoal: 10000
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  if (!profile) return (
    <div className="h-40 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
    </div>
  );

  const handleImageUpload = async (file: File) => {
    if (!auth.currentUser) return;
    setUploading(true);

    try {
      // 1. Create a reference in the bucket
      const fileRef = ref(storage, `avatars/${auth.currentUser.uid}`);

      // 2. Upload the file
      const snapshot = await uploadBytes(fileRef, file);

      // 3. Get the public URL
      const photoURL = await getDownloadURL(snapshot.ref);

      // 4. Update the user's Firebase Auth profile
      await updateProfile(auth.currentUser, { photoURL });
      
      // 5. Update local state
      const updatedProfile = { ...formData, photoURL };
      setFormData(updatedProfile);
      onUpdate(updatedProfile);
      
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 4000);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (auth.currentUser) {
        // Update Firebase Auth profile
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName,
          photoURL: formData.photoURL
        });
      }

      onUpdate(formData);
      setSaved(true);
      setIsEditing(false);
      setShowMessage(true);
      setTimeout(() => {
        setSaved(false);
        setShowMessage(false);
      }, 4000);
    } catch (err) {
      console.error("Save error", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      <AnimatePresence>
        {showMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4"
          >
            <div className="glass border-indigo-500/30 p-4 rounded-2xl flex gap-3 items-center shadow-2xl shadow-indigo-500/20 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-indigo-500/30">
                <img src="https://res.cloudinary.com/dleg7ww07/image/upload/v1/animeint" alt="Miyamura" className="w-full h-full object-cover" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-indigo-400 block">Miyamura</span>
                "Looking good! Your club ID is updated!"
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center relative group">
        <div className="relative inline-block group/avatar cursor-pointer">
          <img 
            src={profile.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.uid} 
            alt="Avatar" 
            className="w-32 h-32 rounded-3xl border-4 border-white/5 object-cover shadow-2xl transition-all group-hover/avatar:brightness-50" 
          />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            ) : (
              <Camera className="w-8 h-8 text-white" />
            )}
          </div>

          <input 
            type="file" 
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
            disabled={uploading}
          />

          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 border-4 border-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-sky-500/20 z-10"
          >
            {isEditing ? <X className="w-4 h-4 text-white" /> : <Edit2 className="w-4 h-4 text-white" />}
          </button>
        </div>
        
        {!isEditing ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-display font-bold mt-6 flex items-center justify-center gap-2">
              {profile.displayName}
              <Sparkles className="w-4 h-4 text-sky-400" />
            </h2>
            <p className="text-gray-500 text-sm">{profile.email}</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 glass p-6 rounded-3xl space-y-4 text-left max-w-sm mx-auto border-indigo-500/10"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Display Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Enter name"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Profile Image URL</label>
              <div className="relative">
                <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  value={formData.photoURL}
                  onChange={(e) => setFormData(prev => ({ ...prev, photoURL: e.target.value }))}
                  placeholder="Paste image URL"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={saving || !formData.displayName.trim()}
              className="w-full h-12 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile
            </button>
          </motion.div>
        )}
      </div>

      <div className="glass-card border-none bg-gradient-to-br from-white/10 via-transparent to-indigo-500/5">
        <h3 className="font-display font-bold mb-8 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            Daily Goals
        </h3>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <GoalInput 
              icon={<Target className="text-blue-500" />} 
              label="Calorie Goal" 
              value={formData.calorieGoal} 
              unit="kcal"
              onChange={(v) => setFormData(prev => ({ ...prev, calorieGoal: parseInt(v) || 0 }))}
            />
            <GoalInput 
              icon={<Droplets className="text-sky-500" />} 
              label="Water Goal" 
              value={formData.waterGoal} 
              unit="ml"
              onChange={(v) => setFormData(prev => ({ ...prev, waterGoal: parseInt(v) || 0 }))}
            />
            <GoalInput 
              icon={<Footprints className="text-indigo-500" />} 
              label="Steps Goal" 
              value={formData.stepGoal} 
              unit="steps"
              onChange={(v) => setFormData(prev => ({ ...prev, stepGoal: parseInt(v) || 0 }))}
            />
          </div>

          <button 
            type="submit"
            disabled={saving}
            className={cn(
                "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
                saved ? "bg-blue-500 text-white" : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/20"
            )}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saving ? "Saving..." : saved ? "Goals Updated!" : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="glass-card opacity-50 pointer-events-none">
        <h3 className="font-display font-bold mb-6">Account Settings</h3>
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                        <div className="text-sm font-bold">Email Notifications</div>
                        <div className="text-xs text-gray-500">Weekly progress reports</div>
                    </div>
                </div>
                <div className="w-12 h-6 bg-white/10 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-gray-500" />
                </div>
            </div>
            <p className="text-[10px] text-center text-gray-500 italic">Advanced settings coming soon in v2.0</p>
        </div>
      </div>
    </div>
  );
}

function GoalInput({ icon, label, value, unit, onChange }: any) {
  return (
    <div className="group">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {icon}
        </div>
        <input 
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full glass bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-16 text-xl font-display font-bold focus:outline-none focus:border-indigo-500/50 transition-all"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
          {unit}
        </span>
      </div>
    </div>
  );
}
