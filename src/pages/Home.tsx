import React from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../types';
import { Play, ShieldCheck, Users, Video } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  user: UserProfile | null;
}

export default function Home({ user }: HomeProps) {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=2000" 
            alt="Dojo background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950"></div>
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter"
          >
            MAÎTRISEZ VOTRE <span className="text-red-600 italic">ART</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto"
          >
            Bienvenue sur Dojo Connect, la plateforme exclusive des licenciés de notre club. 
            Accédez à vos ressources d'entraînement où que vous soyez.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <Link 
                to="/members" 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center space-x-2 transition-all hover:scale-105"
              >
                <Play size={20} fill="currentColor" />
                <span>Accéder aux Vidéos</span>
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
                >
                  Se Connecter
                </Link>
                <Link 
                  to="/register" 
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all"
                >
                  Devenir Membre
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 space-y-4">
          <div className="w-12 h-12 bg-red-600/10 text-red-600 rounded-lg flex items-center justify-center">
            <ShieldCheck size={28} />
          </div>
          <h3 className="text-xl font-bold">Accès Sécurisé</h3>
          <p className="text-zinc-400">Contenu réservé exclusivement aux licenciés du club. Vos données sont protégées.</p>
        </div>
        
        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 space-y-4">
          <div className="w-12 h-12 bg-red-600/10 text-red-600 rounded-lg flex items-center justify-center">
            <Video size={28} />
          </div>
          <h3 className="text-xl font-bold">Vidéos HD</h3>
          <p className="text-zinc-400">Des tutoriels détaillés organisés par niveaux, du débutant à l'expert.</p>
        </div>

        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 space-y-4">
          <div className="w-12 h-12 bg-red-600/10 text-red-600 rounded-lg flex items-center justify-center">
            <Users size={28} />
          </div>
          <h3 className="text-xl font-bold">Communauté</h3>
          <p className="text-zinc-400">Restez connecté avec votre club et progressez à votre rythme entre deux cours.</p>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-zinc-900 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">À propos de notre <span className="text-red-600">Dojo</span></h2>
          <p className="text-zinc-400 leading-relaxed">
            Notre club d'arts martiaux prône les valeurs traditionnelles de respect, de courage et de persévérance. 
            Que vous soyez ici pour la compétition, la self-défense ou le développement personnel, 
            Dojo Connect est votre compagnon digital pour parfaire votre technique.
          </p>
          <ul className="space-y-3">
            {['Plus de 40 membres actifs', 'Instructeurs qualifiés', 'Programmes adaptés à tous les âges', 'Événements et stages réguliers'].map((item, i) => (
              <li key={i} className="flex items-center space-x-3 text-zinc-300">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <img 
            src="https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?auto=format&fit=crop&q=80&w=1000" 
            alt="Martial arts training" 
            className="rounded-2xl shadow-2xl shadow-red-900/20"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>
    </div>
  );
}
