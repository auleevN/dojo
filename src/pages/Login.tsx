import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // DEV PHASE BYPASS: Always use 'bonjour'
    const devPassword = 'bonjour';

    try {
      if (resetMode) {
        await sendPasswordResetEmail(auth, email);
        setSuccess('Un email de réinitialisation a été envoyé.');
        setResetMode(false);
      } else {
        // Check if password is 'bonjour' (Dev requirement)
        if (password !== devPassword) {
          setError('En phase de développement, le mot de passe doit être "bonjour".');
          setLoading(false);
          return;
        }

        try {
          // Try to sign in
          await signInWithEmailAndPassword(auth, email, devPassword);
          navigate('/members');
        } catch (signInErr: any) {
          // If user doesn't exist, auto-register (Dev convenience)
          if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
            const userCredential = await createUserWithEmailAndPassword(auth, email, devPassword);
            const user = userCredential.user;
            
            // Create user profile in Firestore
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              role: email === 'olivier.mobilebox@gmail.com' ? 'admin' : 'member',
              createdAt: serverTimestamp()
            });
            
            navigate('/members');
          } else {
            throw signInErr;
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Erreur de connexion. Assurez-vous d\'utiliser "bonjour".');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600/10 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-bold">{resetMode ? 'Réinitialisation' : 'Bon retour !'}</h1>
          <p className="text-zinc-500">
            {resetMode 
              ? 'Entrez votre email pour recevoir un lien.' 
              : 'Connectez-vous pour accéder à vos vidéos.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-lg mb-6 flex items-center space-x-3">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-900/20 border border-emerald-900/50 text-emerald-400 p-4 rounded-lg mb-6 flex items-center space-x-3">
            <CheckCircle size={20} />
            <p className="text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 flex items-center space-x-2">
              <Mail size={14} />
              <span>Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
              placeholder="votre@email.com"
            />
          </div>

          {!resetMode && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-zinc-400 flex items-center space-x-2">
                  <Lock size={14} />
                  <span>Mot de passe (Tapez 'bonjour')</span>
                </label>
              </div>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                placeholder="bonjour"
              />
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Chargement...' : (resetMode ? 'Envoyer le lien' : 'Se connecter')}
            </button>
            
            {resetMode && (
              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="w-full text-zinc-400 hover:text-white text-sm py-2"
              >
                Retour à la connexion
              </button>
            )}
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-500">
          Pas encore membre ?{' '}
          <Link to="/register" className="text-red-500 hover:underline font-medium">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}

