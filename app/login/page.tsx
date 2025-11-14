"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [loginInput, setLoginInput] = useState(""); // campo único (correo o usuario)
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1️⃣ Validaciones previas
    if (!loginInput || !password) {
      setMessage("⚠ Todos los campos son obligatorios.");
      return;
    }

    let emailToLogin = loginInput;

    // 2️⃣ Si no contiene @, asumimos que es usuario y buscamos el correo
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

      emailToLogin = users.correo; // usamos el correo real para Supabase Auth
    }

    // 3️⃣ Iniciar sesión con Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setMessage("❌ Usuario o contraseña incorrectos.");
      } else {
        setMessage("❌ Error: " + error.message);
      }
      return;
    }

    router.push("/main");
  };

  return (
    <div>
      <h1>Iniciar Sesión</h1>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Correo o Usuario"
          value={loginInput}
          onChange={(e) => setLoginInput(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Ingresar</button>
      </form>

      {message && <p>{message}</p>}

      <Link href="/registro" className="text-blue-600 underline mt-4 block">
        ¿No tienes una cuenta? Crear cuenta
      </Link>
    </div>
  );
}
