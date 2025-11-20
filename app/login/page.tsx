"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!loginInput || !password) {
      setMessage("⚠ Todos los campos son obligatorios.");
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
      return;
    }

    router.push("/main");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-5">Iniciar Sesión</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Correo o Usuario"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Ingresar
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-red-500 text-sm">{message}</p>
        )}

        <Link
          href="/registro"
          className="text-blue-600 text-center mt-4 block underline"
        >
          ¿No tienes una cuenta? Crear cuenta
        </Link>
      </div>
    </div>
  );
}
