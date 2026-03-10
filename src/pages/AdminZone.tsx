import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Video, VIDEO_CATEGORIES, UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../firestoreUtils';
import { Plus, Trash2, Edit2, Video as VideoIcon, Users, Settings, X, Save, AlertCircle } from 'lucide-react';

export default function AdminZone() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'videos' | 'users'>('videos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: VIDEO_CATEGORIES[0],
    url: '',
    duration: ''
  });

  useEffect(() => {
    const qv = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsubVideos = onSnapshot(qv, (snapshot) => {
      setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Video[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videos');
    });

    const qu = collection(db, 'users');
    const unsubUsers = onSnapshot(qu, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => {
      unsubVideos();
      unsubUsers();
    };
  }, []);

  const handleOpenModal = (video?: Video) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        title: video.title,
        description: video.description || '',
        category: video.category,
        url: video.url,
        duration: video.duration || ''
      });
    } else {
      setEditingVideo(null);
      setFormData({
        title: '',
        description: '',
        category: VIDEO_CATEGORIES[0],
        url: '',
        duration: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVideo) {
        await updateDoc(doc(db, 'videos', editingVideo.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'videos'), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, editingVideo ? `videos/${editingVideo.id}` : 'videos');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette vidéo ?")) {
      try {
        await deleteDoc(doc(db, 'videos', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `videos/${id}`);
      }
    }
  };

  const handleChangeRole = async (uid: string, newRole: 'member' | 'admin') => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const handleSeedData = async () => {
    try {
      // First video (previous request)
      await addDoc(collection(db, 'videos'), {
        title: "Vidéo de test Arts Martiaux",
        description: "Vidéo de démonstration pour tester le lecteur et l'accès membre.",
        category: "Débutants",
        url: "https://www.youtube.com/watch?v=EP9NSTy-yZQ",
        duration: "3:45",
        createdAt: serverTimestamp()
      });

      // Second video (new request)
      await addDoc(collection(db, 'videos'), {
        title: "Introduction au Dojo",
        description: "Bienvenue au club ! Cette vidéo explique les bases du Dojo, le salut, et les règles de courtoisie essentielles pour bien débuter votre pratique.",
        category: "Débutants",
        url: "https://www.youtube.com/watch?v=6p_yaNFSYao",
        duration: "1:30",
        createdAt: serverTimestamp()
      });

      alert("Vidéos de test ajoutées avec succès !");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'videos');
    }
  };

  if (loading) return <div className="text-center py-20">Chargement...</div>;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
          <p className="text-zinc-400">Gérez les vidéos et les membres du club.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleSeedData}
            className="text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-800 px-3 py-1 rounded-lg transition-all"
          >
            Initialiser données de test
          </button>
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button 
              onClick={() => setActiveTab('videos')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'videos' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <VideoIcon size={18} />
              <span>Vidéos</span>
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'users' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Users size={18} />
              <span>Membres</span>
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'videos' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{videos.length} Vidéos</h2>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-all"
            >
              <Plus size={18} />
              <span>Ajouter une vidéo</span>
            </button>
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Titre</th>
                  <th className="px-6 py-4 font-medium">Catégorie</th>
                  <th className="px-6 py-4 font-medium">Durée</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {videos.map(video => (
                  <tr key={video.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{video.title}</td>
                    <td className="px-6 py-4 text-zinc-400">{video.category}</td>
                    <td className="px-6 py-4 text-zinc-400">{video.duration || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenModal(video)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">{users.length} Membres</h2>
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Nom</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Rôle</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map(user => (
                  <tr key={user.uid} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{user.displayName || 'Sans nom'}</td>
                    <td className="px-6 py-4 text-zinc-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-red-900/30 text-red-500' : 'bg-zinc-800 text-zinc-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select 
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.uid, e.target.value as any)}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
                      >
                        <option value="member">Membre</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Video */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingVideo ? 'Modifier la vidéo' : 'Ajouter une vidéo'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-sm text-zinc-500">Titre</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-600 outline-none"
                    placeholder="Ex: Kata de base n°1"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm text-zinc-500">Catégorie</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-600 outline-none"
                  >
                    {VIDEO_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-zinc-500">Durée (optionnel)</label>
                  <input 
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-600 outline-none"
                    placeholder="Ex: 5:30"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-sm text-zinc-500">URL de la vidéo (YouTube, Vimeo, etc.)</label>
                  <input 
                    required
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-600 outline-none"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-sm text-zinc-500">Description</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-600 outline-none resize-none"
                    placeholder="Détails techniques, points d'attention..."
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all"
                >
                  <Save size={18} />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
