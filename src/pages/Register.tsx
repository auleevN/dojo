import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const devPassword = 'bonjour';

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, devPassword);
      const user = userCredential.user;

      await updateProfile(user, { displayName });

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName,
        role: email === 'olivier.mobilebox@gmail.com' ? 'admin' : 'member',
        createdAt: new Date().toISOString()
      });

      navigate('/members');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé. Connectez-vous avec "bonjour".');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('L\'inscription par Email/Mot de passe n\'est pas activée dans la console Firebase. Activez-la dans Authentication > Sign-in method.');
      } else {
        setError(`Une erreur est survenue lors de l'inscription : ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600/10 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-2xl font-bold">Rejoignez le Club</h1>
          <p className="text-zinc-500">Créez votre compte licencié en quelques secondes.</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-lg mb-6 flex items-center space-x-3">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 flex items-center space-x-2">
              <User size={14} />
              <span>Nom complet</span>
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
              placeholder="Jean Dupont"
            />
          </div>

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

          <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
            <p className="text-xs text-zinc-400 text-center">
              Note : En phase de développement, le mot de passe est fixé à <span className="text-red-500 font-bold">bonjour</span> pour tout le monde.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Création...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-500">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-red-500 hover:underline font-medium">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
