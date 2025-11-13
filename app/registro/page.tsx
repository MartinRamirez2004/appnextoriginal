"use client";
// 👆 Este componente se ejecuta del lado del cliente (navegador)
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
// 👆 Importamos React y el cliente de Supabase que configuramos en lib
import { useRouter } from "next/navigation";

//Funcion que crea el registro de las personas.
export default function RegisterPage() {
  // 📦 Estados tipados con TypeScript
  const [usuario, setUsuario] = useState<string>("");
  const [contrasena, setContrasena] = useState<string>("");
  const [correo, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();