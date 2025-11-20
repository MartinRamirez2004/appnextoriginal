// app/(auth)/layout.tsx
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <main className="flex-grow pb-16">{children}</main>

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-3 shadow-md">
        <Link href="/main" className="text-gray-600 font-medium hover:text-blue-600">
          Inicio
        </Link>
        <Link href="/subir" className="text-gray-600 font-medium hover:text-blue-600">
          Subir
        </Link>
        <Link href="/perfil" className="text-gray-600 font-medium hover:text-blue-600">
          Perfil
        </Link>
      </nav>
    </div>
  );
}
