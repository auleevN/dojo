import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Video } from '../types';
import { handleFirestoreError, OperationType } from '../firestoreUtils';
import { ArrowLeft, Clock, Tag, Calendar, Share2, Info } from 'lucide-react';

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'videos', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVideo({ id: docSnap.id, ...docSnap.data() } as Video);
        } else {
          navigate('/members');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `videos/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, navigate]);

  // Helper to extract YouTube ID or return URL
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    }
    if (url.includes('vimeo.com')) {
      const match = url.match(/vimeo.com\/(\d+)/);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!video) return null;

  const embedUrl = getEmbedUrl(video.url);
  const isEmbeddable = embedUrl.startsWith('http');

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link to="/members" className="inline-flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span>Retour aux vidéos</span>
      </Link>

      <div className="space-y-6">
        {/* Video Player Container */}
        <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
          {isEmbeddable ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            ></iframe>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <Info size={48} className="text-zinc-600" />
              <p className="text-zinc-400">Cette vidéo ne peut pas être intégrée directement.</p>
              <a 
                href={video.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Regarder sur la plateforme externe
              </a>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">{video.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                <div className="flex items-center space-x-1">
                  <Tag size={14} className="text-red-500" />
                  <span>{video.category}</span>
                </div>
                {video.duration && (
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{video.duration}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>Ajouté le {new Date(video.createdAt?.seconds * 1000 || video.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
              <h3 className="font-bold mb-3 text-zinc-300">Description</h3>
              <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {video.description || "Aucune description fournie pour cette vidéo."}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
              <h3 className="font-bold text-zinc-300">Conseils d'entraînement</h3>
              <p className="text-sm text-zinc-500 italic">
                "La répétition est la mère de la maîtrise. Pratiquez chaque mouvement avec intention."
              </p>
              <div className="pt-4 border-t border-zinc-800">
                <button className="w-full flex items-center justify-center space-x-2 text-zinc-400 hover:text-white transition-colors py-2">
                  <Share2 size={16} />
                  <span>Partager (Lien interne)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
