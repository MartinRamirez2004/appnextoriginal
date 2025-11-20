"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function EditarPerfil() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [usuario, setUsuario] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // ---------------------------
  //   CARGAR DATOS DEL USUARIO
  // ---------------------------
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Obtener usuario autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setMessage("No hay sesión activa");
          return;
        }

        setUserId(user.id);

        // Buscar perfil en la tabla usuarios
        const { data, error } = await supabase
          .from("usuarios")
          .select("usuario, bio, foto_perfil")
          .eq("id_usuario", user.id)
          .maybeSingle(); // Usar maybeSingle() en lugar de single()

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
          // Si no existe el perfil, crear uno
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

  // ---------------------------
  //   SUBIR FOTO DE PERFIL
  // ---------------------------
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

      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        setMessage("Solo se permiten imágenes");
        return;
      }

      // Validar tamaño (máx 15MB)
      if (file.size > 15 * 1024 * 1024) {
        setMessage("La imagen es muy grande (máx 15MB)");
        return;
      }

      const fileName = `${userId}/${Date.now()}-${file.name}`;

      // Subir archivo
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

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from("imagenes_perfil")
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrlData.publicUrl);
      setMessage("Foto actualizada ✨");
    } catch (error) {
      console.error(error);
      setMessage("Error al subir la foto");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  //    GUARDAR CAMBIOS
  // ---------------------------
  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (!userId) {
        setMessage("No hay sesión activa");
        return;
      }

      // Validaciones
      if (!usuario.trim()) {
        setMessage("El nombre de usuario es requerido");
        return;
      }

      if (usuario.trim().length < 3) {
        setMessage("El nombre de usuario debe tener al menos 3 caracteres");
        return;
      }

      // Actualizar perfil
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
        
        // Manejar errores específicos
        if (error.code === "23505") {
          setMessage("Ese nombre de usuario ya está en uso");
        } else {
          setMessage("No se pudieron guardar los cambios");
        }
        return;
      }

      setMessage("Cambios guardados ✔️");
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setMessage("Error inesperado al guardar");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  //     UI
  // ---------------------------
  return (
    <div className="max-w-md mx-auto p-4 flex flex-col gap-6">
      {/* Foto */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-gray-300">
          {avatarUrl ? (
            <Image 
              src={avatarUrl} 
              alt="avatar" 
              fill 
              className="object-cover"
              unoptimized // Añadir si tienes problemas con imágenes de Supabase
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
              Sin foto
            </div>
          )}
        </div>

        <label className="text-blue-600 font-medium cursor-pointer hover:text-blue-700">
          Cambiar foto
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatar}
            disabled={loading}
          />
        </label>
      </div>

      {/* Formulario */}
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-gray-700 mb-1 font-medium">
            Nombre de usuario
          </label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tu_usuario"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1 font-medium">
            Biografía
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border rounded-lg p-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Cuéntanos algo sobre ti..."
            disabled={loading}
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1">
            {bio.length}/200 caracteres
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>

      {message && (
        <p className={`text-center text-sm ${
          message.includes("✔️") || message.includes("✨") 
            ? "text-green-600" 
            : "text-red-600"
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}