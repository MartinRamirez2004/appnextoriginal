"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!usuario || !email || !password) {
      setMessage("⚠️ Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9]{5,20}$/;
    if (!usernameRegex.test(usuario.trim())) {
      setMessage("⚠️ El usuario debe tener entre 5 y 20 caracteres sin espacios.");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setMessage("⚠️ Correo inválido.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("⚠️ La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMessage("❌ Error en registro: " + authError.message);
      setLoading(false);
      return;
    }

    // Ya no necesitas insertar manualmente porque el trigger lo hace
    setMessage("✅ Registro exitoso. Redirigiendo...");
    
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo o título principal */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl sm:text-3xl font-bold">+</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Crear Cuenta
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Únete y comienza tu experiencia
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                placeholder="tunombreusuario"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                5-20 caracteres, solo letras y números
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 6 caracteres
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? "Creando cuenta..." : "Registrarme"}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm text-center ${
              message.includes("❌") || message.includes("⚠️")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}>
              {message}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-green-600 hover:text-green-700 font-medium text-sm sm:text-base inline-flex items-center gap-1 transition-colors"
            >
              ¿Ya tienes cuenta?
              <span className="underline">Inicia sesión</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs sm:text-sm mt-6">
          Al registrarte, aceptas nuestros términos de servicio y política de privacidad
        </p>
      </div>
    </div>
  );
}