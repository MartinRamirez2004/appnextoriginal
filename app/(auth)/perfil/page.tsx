"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PerfilPage() {
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [bio, setBio] = useState<string | null>(null);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Función separada para cargar datos
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        router.push("/login");
        return;
      }

      const userId = session.user.id;

      // Obtener datos del usuario (agregamos bio al select)
      const { data: user, error: userError } = await supabase
        .from("usuarios")
        .select("usuario, correo, foto_perfil, bio")
        .eq("id_usuario", userId)
        .single();

      if (userError) {
        console.error("Error al obtener usuario:", userError);
        return;
      }

      setUsuario(user.usuario);
      setCorreo(user.correo);
      setBio(user.bio);
      // Añadir timestamp para forzar recarga de imagen
      setFotoPerfil(user.foto_perfil ? `${user.foto_perfil}?t=${Date.now()}` : null);

      // Obtener publicaciones
      const { data: posts } = await supabase
        .from("publicaciones")
        .select("id_publicacion, imagen_url")
        .eq("id_usuario", userId)
        .order("fecha_publicacion", { ascending: false });

      setPublicaciones(posts || []);
    } catch (error) {
      console.error("Error inesperado:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Recargar datos cuando la página vuelve a estar visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Limpiar el listener al desmontar
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  // Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const goToEdit = () => router.push("/editar-perfil");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header del perfil */}
      <div className="flex items-center gap-4 mb-6">
        {/* Foto perfil */}
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 flex-shrink-0">
          {fotoPerfil ? (
            <img 
              src={fotoPerfil} 
              alt="Foto de perfil"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Si la imagen falla al cargar, mostrar inicial
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl font-bold bg-gradient-to-br from-blue-400 to-purple-500 text-white">
              {usuario ? usuario[0].toUpperCase() : "?"}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-xl font-bold">{usuario}</h1>
          <p className="text-gray-600 text-sm">{correo}</p>
          <p className="text-gray-700 mt-1">
            <strong>{publicaciones.length}</strong> publicaciones
          </p>
        </div>
      </div>

      {/* Biografía */}
      {bio && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {bio}
          </p>
        </div>
      )}

      {/* Galería */}
      <h2 className="text-lg font-semibold mb-3">Mis publicaciones</h2>

      {publicaciones.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Aún no has publicado nada.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {publicaciones.map((post) => (
            <div key={post.id_publicacion} className="w-full aspect-square">
              <img
                src={post.imagen_url}
                className="w-full h-full object-cover rounded"
                alt="Publicación"
              />
            </div>
          ))}
        </div>
      )}

      {/* Botones */}
      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={goToEdit}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Editar perfil
        </button>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}