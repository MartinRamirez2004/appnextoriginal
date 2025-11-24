"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function EditarPerfil() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [usuario, setUsuario] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setMessage("No hay sesión activa");
          return;
        }

        setUserId(user.id);

        const { data, error } = await supabase
          .from("usuarios")
          .select("usuario, bio, foto_perfil")
          .eq("id_usuario", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error al cargar perfil:", error);
          setMessage("Error al cargar el perfil");
          return;
        }

        if (data) {
          setUsuario(data.usuario || "");
          setBio(data.bio || "");
          setAvatarUrl(data.foto_perfil || null);
        } else {
          const { error: insertError } = await supabase
            .from("usuarios")
            .insert({
              id_usuario: user.id,
              usuario: user.email?.split("@")[0] || "usuario",
              correo: user.email || "",
              bio: "",
            });

          if (insertError) {
            console.error("Error al crear perfil:", insertError);
          }
        }
      } catch (error) {
        console.error("Error inesperado:", error);
        setMessage("Error al cargar datos");
      }
    };

    loadProfile();
  }, []);

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setMessage("");

      if (!userId) {
        setMessage("No hay sesión activa");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setMessage("Solo se permiten imágenes");
        return;
      }

      if (file.size > 15 * 1024 * 1024) {
        setMessage("La imagen es muy grande (máx 15MB)");
        return;
      }

      const fileName = `${userId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("imagenes_perfil")
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) {
        console.error("Error al subir:", uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("imagenes_perfil")
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrlData.publicUrl);
      setMessage("✨ Foto actualizada correctamente");
    } catch (error) {
      console.error(error);
      setMessage("Error al subir la foto");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (!userId) {
        setMessage("No hay sesión activa");
        return;
      }

      if (!usuario.trim()) {
        setMessage("El nombre de usuario es requerido");
        return;
      }

      if (usuario.trim().length < 3) {
        setMessage("El nombre de usuario debe tener al menos 3 caracteres");
        return;
      }

      const { error } = await supabase
        .from("usuarios")
        .update({
          usuario: usuario.trim(),
          bio: bio.trim(),
          foto_perfil: avatarUrl,
        })
        .eq("id_usuario", userId);

      if (error) {
        console.error("Error al actualizar:", error);
        
        if (error.code === "23505") {
          setMessage("Ese nombre de usuario ya está en uso");
        } else {
          setMessage("No se pudieron guardar los cambios");
        }
        return;
      }

      setMessage("✅ Cambios guardados exitosamente");
      
      setTimeout(() => {
        router.push("/perfil");
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage("Error inesperado al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Editar Perfil
          </h1>
          <p className="text-gray-600">Personaliza tu información</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          
          {/* Foto de perfil */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group mb-4">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-purple-500">
                {avatarUrl ? (
                  <Image 
                    src={avatarUrl} 
                    alt="avatar" 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                    {usuario ? usuario[0].toUpperCase() : "?"}
                  </div>
                )}
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 cursor-pointer font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {loading ? "Subiendo..." : "Cambiar foto"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatar}
                disabled={loading}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">PNG, JPG o GIF (máx. 15MB)</p>
          </div>

          {/* Campos del formulario */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de usuario
              </label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                placeholder="tu_usuario"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 3 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Biografía
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-sm sm:text-base"
                placeholder="Cuéntanos algo sobre ti..."
                disabled={loading}
                maxLength={200}
                rows={4}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Comparte un poco sobre ti
                </p>
                <p className="text-xs text-gray-500">
                  {bio.length}/200
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar cambios
                </>
              )}
            </button>

            <button
              onClick={() => router.back()}
              disabled={loading}
              className="w-full py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div className={`mt-6 p-4 rounded-xl text-center font-medium ${
              message.includes("✅") || message.includes("✨")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}