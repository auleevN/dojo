import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Video, VIDEO_CATEGORIES, UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../firestoreUtils';
import { Plus, Trash2, Edit2, Video as VideoIcon, Users, Settings, X, Save, AlertCircle, Search, Shield } from 'lucide-react';

export default function AdminZone() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'videos' | 'users'>('videos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [urlError, setUrlError] = useState('');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: VIDEO_CATEGORIES[0],
    url: '',
    duration: '',
    thumbnail: ''
  });

  const getYoutubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
    }
    return '';
  };

  useEffect(() => {
    if (formData.url && !formData.thumbnail) {
      const thumb = getYoutubeThumbnail(formData.url);
      if (thumb) setFormData(prev => ({ ...prev, thumbnail: thumb }));
    }
  }, [formData.url]);

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
    setUrlError('');
    setGlobalError(null);
    if (video) {
      setEditingVideo(video);
      setFormData({
        title: video.title,
        description: video.description || '',
        category: video.category,
        url: video.url,
        duration: video.duration || '',
        thumbnail: video.thumbnail || ''
      });
    } else {
      setEditingVideo(null);
      setFormData({
        title: 'Nouvelle technique',
        description: '',
        category: VIDEO_CATEGORIES[0],
        url: '',
        duration: '',
        thumbnail: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+$/;
    
    if (!youtubeRegex.test(formData.url) && !vimeoRegex.test(formData.url)) {
      setUrlError('Veuillez entrer une URL YouTube ou Vimeo valide');
      return;
    }
    
    setUrlError('');
    setGlobalError(null);
    try {
      const finalData = {
        ...formData,
        title: formData.title.trim() || 'Vidéo sans titre',
      };

      if (editingVideo) {
        await updateDoc(doc(db, 'videos', editingVideo.id), {
          ...finalData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'videos'), {
          ...finalData,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      setGlobalError("Erreur lors de l'enregistrement de la vidéo. Vérifiez votre connexion ou vos permissions.");
      handleFirestoreError(err, OperationType.WRITE, editingVideo ? `videos/${editingVideo.id}` : 'videos');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette vidéo ?")) {
      setGlobalError(null);
      try {
        await deleteDoc(doc(db, 'videos', id));
      } catch (err) {
        setGlobalError("Erreur lors de la suppression de la vidéo.");
        handleFirestoreError(err, OperationType.DELETE, `videos/${id}`);
      }
    }
  };

  const handleChangeRole = async (uid: string, newRole: 'member' | 'admin') => {
    setGlobalError(null);
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
    } catch (err) {
      setGlobalError("Erreur lors du changement de rôle de l'utilisateur.");
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
        thumbnail: "https://img.youtube.com/vi/EP9NSTy-yZQ/maxresdefault.jpg",
        duration: "3:45",
        createdAt: serverTimestamp()
      });

      // Second video (new request)
      await addDoc(collection(db, 'videos'), {
        title: "Introduction au Dojo",
        description: "Bienvenue au club ! Cette vidéo explique les bases du Dojo, le salut, et les règles de courtoisie essentielles pour bien débuter votre pratique.",
        category: "Débutants",
        url: "https://www.youtube.com/watch?v=6p_yaNFSYao",
        thumbnail: "https://img.youtube.com/vi/6p_yaNFSYao/maxresdefault.jpg",
        duration: "1:30",
        createdAt: serverTimestamp()
      });

      alert("Vidéos de test ajoutées avec succès !");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'videos');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(userSearch.toLowerCase()) || 
    (user.displayName && user.displayName.toLowerCase().includes(userSearch.toLowerCase()))
  );

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
            onClick={() => handleOpenModal()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-all shadow-lg shadow-red-900/20"
          >
            <Plus size={18} />
            <span>Ajouter une vidéo</span>
          </button>
          <button 
            onClick={handleSeedData}
            className="text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-800 px-3 py-1 rounded-lg transition-all"
          >
            Initialiser données
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

      {globalError && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-center justify-between text-red-200">
          <div className="flex items-center space-x-3">
            <AlertCircle size={20} />
            <span>{globalError}</span>
          </div>
          <button onClick={() => setGlobalError(null)} className="text-red-400 hover:text-red-200">
            <X size={18} />
          </button>
        </div>
      )}

      {activeTab === 'videos' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{videos.length} Vidéos</h2>
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
                        className="inline-flex items-center space-x-1 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-all"
                        title="Supprimer la vidéo"
                      >
                        <Trash2 size={16} />
                        <span className="text-xs font-medium">Supprimer</span>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold">{filteredUsers.length} Membres</h2>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text"
                placeholder="Rechercher un membre..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-red-600 outline-none transition-all"
              />
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Membre</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Rôle Actuel</th>
                  <th className="px-6 py-4 font-medium text-right">Modifier le Rôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredUsers.map(user => (
                  <tr key={user.uid} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 font-bold">
                          {(user.displayName || user.email)[0].toUpperCase()}
                        </div>
                        <span className="font-medium">{user.displayName || 'Sans nom'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-red-900/20 text-red-500 border border-red-500/20' 
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {user.role === 'admin' ? 'Administrateur' : 'Membre'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <Shield size={14} className={user.role === 'admin' ? 'text-red-500' : 'text-zinc-600'} />
                        <select 
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.uid, e.target.value as any)}
                          className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-all cursor-pointer hover:border-zinc-700"
                        >
                          <option value="member">Membre</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                      Aucun membre trouvé pour "{userSearch}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating Action Button for Quick Add */}
      <button 
        onClick={() => handleOpenModal()}
        className="fixed bottom-8 right-8 z-50 bg-red-600 hover:bg-red-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all active:scale-95 group"
        title="Ajouter une vidéo"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

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
                  <label className="text-sm text-zinc-500">URL de la vidéo (YouTube, Vimeo, etc.)</label>
                  <div className="flex gap-2">
                    <input 
                      required
                      value={formData.url}
                      onChange={e => {
                        setFormData({...formData, url: e.target.value});
                        if (urlError) setUrlError('');
                      }}
                      className={`flex-1 bg-zinc-950 border ${urlError ? 'border-red-500' : 'border-zinc-800'} rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-600 outline-none transition-colors`}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        const thumb = getYoutubeThumbnail(formData.url);
                        if (thumb) setFormData({...formData, thumbnail: thumb});
                      }}
                      className="px-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs transition-all"
                    >
                      Actualiser
                    </button>
                  </div>
                  {urlError && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {urlError}
                    </p>
                  )}
                </div>

                {formData.thumbnail && (
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm text-zinc-500">Aperçu de la miniature</label>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800">
                      <img 
                        src={formData.thumbnail} 
                        alt="Aperçu" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}

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
                  <label className="text-sm text-zinc-500">URL miniature (optionnel)</label>
                  <input 
                    value={formData.thumbnail}
                    onChange={e => setFormData({...formData, thumbnail: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-600 outline-none"
                    placeholder="https://..."
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
