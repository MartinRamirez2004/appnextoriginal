import Link from "next/link";
import "../globals.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>

        {/* Barra visible solo dentro de (auth) */}
        <nav className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-2">
          <Link href="/main" className="text-gray-600 hover:text-blue-500">Inicio</Link>
          <Link href="/subir" className="text-gray-600 hover:text-blue-500">Subir</Link>
          <Link href="/perfil" className="text-gray-600 hover:text-blue-500">Perfil</Link>
        </nav>
      </body>
    </html>
  );
}
