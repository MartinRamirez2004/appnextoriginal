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

    // 1️. Validaciones previas
    if (!usuario || !email || !password) {
      setMessage("⚠ Todos los campos son obligatorios.");
      return;
    }

    const username = usuario.trim();
    const usernameRegex = /^[a-zA-Z0-9]{5,20}$/;

    if (!usernameRegex.test(username)) {
      setMessage("El usuario debe tener entre 5 y 20 caracteres, sin espacios y solo con letras o números.");
    return;
    }

    if (!email.includes("@")) {
      setMessage("Por favor ingresa un correo válido.");
      return;
    }

    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    // 2️. Registrar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      setMessage("Error en registro: " + authError.message);
      return;
    }

    // 3️. Guardar datos en tu tabla personalizada
    const { error: insertError } = await supabase
      .from("usuarios")
      .insert([
        {
          usuario: usuario,
          correo: email,
          contraseña: password,
        },
      ]);

    if (insertError) {
      setMessage("❌ Error guardando datos: " + insertError.message);
      return;
    }

    setMessage("✔ Registro exitoso. Revisa tu correo.");
    router.push("/login");
  };

  return (
    <div>
      <h1>Registro</h1>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Registrarme</button>
      </form>

      {message && <p>{message}</p>}

      <Link href="/login" className="text-blue-600 underline mt-4 block">
        Volver a Inicio Sesion
      </Link>
    </div>
  );
}
