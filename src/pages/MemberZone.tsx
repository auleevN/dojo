import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Video, VIDEO_CATEGORIES } from '../types';
import { handleFirestoreError, OperationType } from '../firestoreUtils';
import { Link } from 'react-router-dom';
import { Play, Clock, Tag, Search, Filter, Video as VideoIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function MemberZone() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  useEffect(() => {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videoList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Video[];
      setVideos(videoList);
      setFilteredVideos(videoList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videos');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = videos;
    
    if (search) {
      result = result.filter(v => 
        v.title.toLowerCase().includes(search.toLowerCase()) || 
        v.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'Toutes') {
      result = result.filter(v => v.category === selectedCategory);
    }
    
    setFilteredVideos(result);
  }, [search, selectedCategory, videos]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Vidéos d'Entraînement</h1>
        <p className="text-zinc-400">Accédez à l'ensemble des techniques et tutoriels du club.</p>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Rechercher une vidéo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-zinc-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="Toutes">Toutes les catégories</option>
            {VIDEO_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Video Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link 
                to={`/video/${video.id}`}
                className="group block bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-red-600/50 transition-all hover:shadow-lg hover:shadow-red-900/10"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                  <img 
                    src={video.thumbnail || `https://picsum.photos/seed/${video.id}/640/360`} 
                    alt={video.title}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform shadow-xl">
                      <Play size={24} fill="white" className="text-white ml-1" />
                    </div>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{video.duration}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-medium text-red-500 uppercase tracking-wider">
                    <Tag size={12} />
                    <span>{video.category}</span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight group-hover:text-red-500 transition-colors">{video.title}</h3>
                  <p className="text-zinc-500 text-sm line-clamp-2">{video.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
          <VideoIcon className="mx-auto text-zinc-700 mb-4" size={48} />
          <p className="text-zinc-500">Aucune vidéo trouvée pour votre recherche.</p>
        </div>
      )}
    </div>
  );
}
