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
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!usuario || !email || !password) {
      setMessage("⚠ Todos los campos son obligatorios.");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9]{5,20}$/;
    if (!usernameRegex.test(usuario.trim())) {
      setMessage("El usuario debe tener entre 5 y 20 caracteres y sin espacios.");
      return;
    }

    if (!email.includes("@")) {
      setMessage("Correo inválido.");
      return;
    }

    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMessage("Error en registro: " + authError.message);
      return;
    }

    const { error: insertError } = await supabase.from("usuarios").insert([
      {
        usuario,
        correo: email,
        contraseña: password,
      },
    ]);

    if (insertError) {
      setMessage("❌ Error guardando datos: " + insertError.message);
      return;
    }

    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-5">Registro</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:ring-2 outline-none"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <input
            type="email"
            placeholder="Correo"
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:ring-2 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:ring-2 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Registrarme
          </button>
        </form>

        {message && <p className="mt-4 text-center text-red-500">{message}</p>}

        <Link
          href="/login"
          className="text-blue-600 text-center mt-4 block underline"
        >
          Volver a Inicio Sesión
        </Link>
      </div>
    </div>
  );
}
