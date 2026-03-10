import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';
import { LogOut, User as UserIcon, Shield, Video as VideoIcon, Menu, X } from 'lucide-react';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MemberZone from './pages/MemberZone';
import VideoDetail from './pages/VideoDetail';
import AdminZone from './pages/AdminZone';
import Profile from './pages/Profile';

import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ uid: firebaseUser.uid, ...userDoc.data() } as UserProfile);
          } else {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email!, role: 'member' });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email!, role: 'member' });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
          {/* Navigation */}
          <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                    <span className="font-bold text-white">D</span>
                  </div>
                  <span className="text-xl font-bold tracking-tight">DOJO<span className="text-red-600">CONNECT</span></span>
                </Link>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="hover:text-red-500 transition-colors">Accueil</Link>
                {user && (
                  <>
                    <Link to="/members" className="hover:text-red-500 transition-colors">Vidéos</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center space-x-1 text-red-500 hover:text-red-400 font-medium">
                        <Shield size={16} />
                        <span>Admin</span>
                      </Link>
                    )}
                    <div className="h-4 w-px bg-zinc-700 mx-2"></div>
                    <Link to="/profile" className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                      <UserIcon size={18} />
                      <span>{user.displayName || 'Profil'}</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-1 text-zinc-400 hover:text-white transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Déconnexion</span>
                    </button>
                  </>
                )}
                {!user && (
                  <div className="flex items-center space-x-4">
                    <Link to="/login" className="text-zinc-400 hover:text-white transition-colors">Connexion</Link>
                    <Link to="/register" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      S'inscrire
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-zinc-400 hover:text-white"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-zinc-900 border-b border-zinc-800 px-4 pt-2 pb-6 space-y-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-red-500">Accueil</Link>
              {user ? (
                <>
                  <Link to="/members" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-red-500">Vidéos</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block py-2 text-red-500">Administration</Link>
                  )}
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-red-500">Mon Profil</Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left py-2 text-zinc-400"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-red-500">Connexion</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block py-2 text-red-500">S'inscrire</Link>
                </>
              )}
            </div>
          )}
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/members" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/members" />} />
            
            <Route path="/members" element={user ? <MemberZone /> : <Navigate to="/login" />} />
            <Route path="/video/:id" element={user ? <VideoDetail /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
            
            <Route path="/admin" element={user?.role === 'admin' ? <AdminZone /> : <Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="border-t border-zinc-800 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-zinc-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Dojo Connect. Tous droits réservés.</p>
            <p className="mt-2 italic">L'excellence par la discipline et le respect.</p>
          </div>
        </footer>
      </div>
    </Router>
  </ErrorBoundary>
  );
}
