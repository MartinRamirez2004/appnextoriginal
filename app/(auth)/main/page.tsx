'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Publicacion {
  id_publicacion: string;
  titulo: string | null;
  descripcion: string | null;
  imagen_url: string;
  fecha_publicacion: string;
  usuarios: { usuario: string; foto_perfil: string | null }[] | null;
  likes: { id_like: string }[] | null;
}

export default function Feed() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerPublicaciones();
  }, []);

  async function obtenerPublicaciones() {
    setLoading(true);
    const { data, error } = await supabase
      .from('publicaciones')
      .select(`
        id_publicacion,
        titulo,
        descripcion,
        imagen_url,
        fecha_publicacion,
        usuarios (usuario, foto_perfil),
        likes (id_like)
      `)
      .order('fecha_publicacion', { ascending: false });

    if (error) {
      console.error('Error al obtener publicaciones:', error);
      setLoading(false);
      return;
    }

    setPublicaciones(data ?? []);
    setLoading(false);
  }

  const formatearFecha = (fecha: string) => {
    const ahora = new Date();
    const fechaPublicacion = new Date(fecha);
    const diferencia = ahora.getTime() - fechaPublicacion.getTime();
    
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);
    
    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos}m`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    
    return fechaPublicacion.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando publicaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Feed
          </h1>
          <p className="text-gray-600">Descubre las últimas publicaciones</p>
        </div>

        {/* Lista de publicaciones */}
        <div className="space-y-6">
          {publicaciones.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Aún no hay publicaciones
              </p>
              <p className="text-gray-500">
                Sé el primero en compartir algo 😊
              </p>
            </div>
          ) : (
            publicaciones.map((post, index) => (
              <article 
                key={post.id_publicacion} 
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'slideUp 0.5s ease-out forwards',
                  opacity: 0
                }}
              >
                {/* Header del post */}
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                    {post.usuarios && post.usuarios[0]?.foto_perfil ? (
                      <img 
                        src={post.usuarios[0].foto_perfil} 
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (post.usuarios && post.usuarios[0]?.usuario 
                        ? post.usuarios[0].usuario[0].toUpperCase() 
                        : '?')
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {post.usuarios && post.usuarios[0]?.usuario || 'Usuario desconocido'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatearFecha(post.fecha_publicacion)}
                    </p>
                  </div>

                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>

                {/* Imagen de la publicación */}
                {post.imagen_url && (
                  <div className="relative w-full bg-gray-100">
                    <img
                      src={post.imagen_url}
                      alt={post.titulo || 'Publicación'}
                      className="w-full h-auto object-contain max-h-[600px]"
                    />
                  </div>
                )}

                {/* Acciones */}
                <div className="px-4 py-3 flex items-center gap-4">
                  <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors group">
                    <svg className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-semibold text-sm text-gray-700">
                      {Array.isArray(post.likes) ? post.likes.length : 0}
                    </span>
                  </button>

                  <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>

                  <button className="ml-auto hover:bg-gray-100 p-2 rounded-lg transition-colors">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>

                {/* Descripción */}
                {post.descripcion && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-800">
                      <span className="font-semibold">
                        {post.usuarios && post.usuarios[0]?.usuario || 'Usuario'}
                      </span>{' '}
                      <span className="text-gray-700">{post.descripcion}</span>
                    </p>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}