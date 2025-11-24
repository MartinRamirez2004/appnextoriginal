"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!loginInput || !password) {
      setMessage("⚠️ Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    let emailToLogin = loginInput;

    if (!loginInput.includes("@")) {
      const { data: users, error: fetchError } = await supabase
        .from("usuarios")
        .select("correo")
        .eq("usuario", loginInput)
        .single();

      if (fetchError || !users) {
        setMessage("❌ Usuario no encontrado.");
        setLoading(false);
        return;
      }

      emailToLogin = users.correo;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password,
    });

    if (error) {
      setMessage("❌ Usuario o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    router.push("/main");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo o título principal */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl sm:text-3xl font-bold">A</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Bienvenido
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo o Usuario
              </label>
              <input
                type="text"
                placeholder="usuario@ejemplo.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? "Iniciando sesión..." : "Ingresar"}
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
              href="/registro"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base inline-flex items-center gap-1 transition-colors"
            >
              ¿No tienes una cuenta?
              <span className="underline">Crear cuenta</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs sm:text-sm mt-6">
          Al iniciar sesión, aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
}