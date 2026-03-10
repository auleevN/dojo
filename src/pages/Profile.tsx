import React, { useState } from 'react';
import { updateProfile, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../firestoreUtils';
import { User, Mail, Shield, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
}

export default function Profile({ user, setUser }: ProfileProps) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
        await updateDoc(doc(db, 'users', user.uid), { displayName });
        setUser({ ...user, displayName });
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit faire au moins 6 caractères.' });
      return;
    }

    setLoading(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setNewPassword('');
        setConfirmPassword('');
        setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès.' });
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'Veuillez vous reconnecter avant de changer votre mot de passe.' });
      } else {
        setMessage({ type: 'error', text: 'Erreur lors du changement de mot de passe.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
        <p className="text-zinc-400">Gérez vos informations personnelles et votre sécurité.</p>
      </header>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 border ${
          message.type === 'success' 
            ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-400' 
            : 'bg-red-900/20 border-red-900/50 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid gap-8">
        {/* Profile Info */}
        <section className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Informations Générales</h2>
              <p className="text-sm text-zinc-500">Votre identité sur la plateforme.</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-500">Email (non modifiable)</label>
              <div className="flex items-center space-x-3 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-500">Rôle</label>
              <div className="flex items-center space-x-3 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-red-500 font-bold uppercase text-xs tracking-widest">
                <Shield size={16} />
                <span>{user.role}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-500">Nom complet</label>
              <input 
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <Save size={18} />
              <span>Enregistrer les modifications</span>
            </button>
          </form>
        </section>

        {/* Security */}
        <section className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Sécurité</h2>
              <p className="text-sm text-zinc-500">Changez votre mot de passe.</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-500">Nouveau mot de passe</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-600 outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-500">Confirmer le mot de passe</label>
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-600 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || !newPassword}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <Lock size={18} />
              <span>Mettre à jour le mot de passe</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
