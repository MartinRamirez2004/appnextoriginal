'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Publicacion {
  id_publicacion: string;
  titulo: string | null;
  descripcion: string | null;
  imagen_url: string;
  fecha_publicacion: string;
  usuarios: { usuario: string }[] | null; // Array en lugar de objeto único
  likes: { id_like: string }[] | null;
}

export default function Feed() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);

  useEffect(() => {
    obtenerPublicaciones();
  }, []);

  async function obtenerPublicaciones() {
  const { data, error } = await supabase
    .from('publicaciones')
    .select(`
      id_publicacion,
      titulo,
      descripcion,
      imagen_url,
      fecha_publicacion,
      usuarios (usuario),
      likes (id_like)
    `)
    .order('fecha_publicacion', { ascending: false });

  if (error) {
    console.error('Error al obtener publicaciones:', error);
    return;
  }

  setPublicaciones(data ?? []);
}

  return (
    <div className="p-4 space-y-6">
      {publicaciones.length === 0 ? (
        <p className="text-center text-gray-500">Aún no hay publicaciones 😅</p>
      ) : (
        publicaciones.map((post) => (
          <div key={post.id_publicacion} className="bg-white shadow-md rounded-lg p-3">
            {post.imagen_url && (
              <img
                src={post.imagen_url}
                alt={post.titulo || 'Publicación'}
                className="rounded-md w-full"
              />
            )}
            {post.descripcion && (
              <p className="mt-2 text-sm text-gray-700">{post.descripcion}</p>
            )}
            <p className="text-xs text-gray-500">{new Date(post.fecha_publicacion).toLocaleDateString()}</p>
            <p className="text-sm text-gray-800">{Array.isArray(post.likes) ? post.likes.length : 0} likes</p>
            <p className="text-xs text-blue-600">{post.usuarios && post.usuarios[0]?.usuario || 'Usuario desconocido'}</p>
          </div>
        ))
      )}
    </div>
  );
}
