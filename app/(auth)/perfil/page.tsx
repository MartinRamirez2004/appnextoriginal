"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function PerfilPage() {
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [bio, setBio] = useState<string | null>(null);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

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
      setFotoPerfil(user.foto_perfil ? `${user.foto_perfil}?t=${Date.now()}` : null);

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

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const goToEdit = () => router.push("/editar-perfil");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header del perfil */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            
            {/* Foto de perfil */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 border-4 border-white shadow-lg flex-shrink-0">
                {fotoPerfil ? (
                  <img 
                    src={fotoPerfil} 
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                    {usuario ? usuario[0].toUpperCase() : "?"}
                  </div>
                )}
              </div>
            </div>

            {/* Info del usuario */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                {usuario}
              </h1>
              <p className="text-gray-500 text-sm sm:text-base mb-3">{correo}</p>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-100">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-gray-700">
                  {publicaciones.length}
                </span>
                <span className="text-gray-600 text-sm">
                  {publicaciones.length === 1 ? 'publicación' : 'publicaciones'}
                </span>
              </div>
            </div>
          </div>

          {/* Biografía */}
          {bio && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {bio}
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={goToEdit}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar perfil
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-red-500 text-red-600 rounded-xl hover:bg-red-50 transition-all font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Galería de publicaciones */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Mis publicaciones
          </h2>

          {publicaciones.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg mb-2">Aún no has publicado nada</p>
              <p className="text-gray-400 text-sm">Tus publicaciones aparecerán aquí</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {publicaciones.map((post, index) => (
                <div 
                  key={post.id_publicacion} 
                  className="aspect-square group cursor-pointer overflow-hidden rounded-lg sm:rounded-xl bg-gray-100 hover:shadow-lg transition-all duration-300"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'fadeIn 0.5s ease-out forwards',
                    opacity: 0
                  }}
                >
                  <img
                    src={post.imagen_url}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    alt="Publicación"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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