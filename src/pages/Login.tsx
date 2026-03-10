import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, CheckCircle, Chrome } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          role: user.email === 'olivier.mobilebox@gmail.com' ? 'admin' : 'member',
          createdAt: serverTimestamp()
        });
      }
      navigate('/members');
    } catch (err: any) {
      console.error('Google Login Error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('La connexion Google n\'est pas activée dans la console Firebase.');
      } else {
        setError(`Erreur Google : ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

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
        if (password !== devPassword) {
          setError('En phase de développement, le mot de passe doit être "bonjour".');
          setLoading(false);
          return;
        }

        try {
          await signInWithEmailAndPassword(auth, email, devPassword);
          navigate('/members');
        } catch (signInErr: any) {
          console.log('SignIn Error Code:', signInErr.code);
          
          if (signInErr.code === 'auth/operation-not-allowed') {
            setError('La connexion par Email/Mot de passe n\'est pas activée dans la console Firebase. Activez-la dans Authentication > Sign-in method.');
          } else if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/user-disabled') {
            try {
              const userCredential = await createUserWithEmailAndPassword(auth, email, devPassword);
              const user = userCredential.user;
              
              await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                role: email === 'olivier.mobilebox@gmail.com' ? 'admin' : 'member',
                createdAt: serverTimestamp()
              });
              
              navigate('/members');
            } catch (createErr: any) {
              console.error('Create User Error:', createErr);
              if (createErr.code === 'auth/operation-not-allowed') {
                setError('L\'inscription par Email/Mot de passe n\'est pas activée dans la console Firebase.');
              } else {
                setError(`Erreur lors de la création du compte : ${createErr.code || createErr.message}`);
              }
            }
          } else {
            setError(`Erreur Firebase : ${signInErr.code || signInErr.message}`);
          }
        }
      }
    } catch (err: any) {
      console.error('Global Login Error:', err);
      setError(`Erreur de connexion : ${err.message}`);
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
            
            {!resetMode && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-zinc-900 text-zinc-500 uppercase tracking-wider">Ou</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Chrome size={18} />
                  <span>Continuer avec Google</span>
                </button>
              </>
            )}
            
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

