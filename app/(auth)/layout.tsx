// app/(auth)/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "../../app/globals.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/main",
      label: "Inicio",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: "/subir",
      label: "Subir",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      isSpecial: true,
    },
    {
      href: "/perfil",
      label: "Perfil",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen flex flex-col">
      <main className="flex-grow pb-20 sm:pb-24">{children}</main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        {/* Blur background effect */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-lg border-t border-gray-200"></div>
        
        {/* Navigation content */}
        <div className="relative max-w-lg mx-auto px-4 sm:px-6">
          <div className="flex justify-around items-center py-2 sm:py-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              if (item.isSpecial) {
                // Botón especial para "Subir"
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center justify-center -mt-8 sm:-mt-10"
                  >
                    <div className={`
                      w-14 h-14 sm:w-16 sm:h-16 rounded-full 
                      bg-gradient-to-r from-blue-600 to-purple-600 
                      flex items-center justify-center 
                      shadow-lg hover:shadow-xl 
                      transition-all duration-300 
                      hover:scale-110 active:scale-95
                      border-4 border-white
                    `}>
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </Link>
                );
              }

              // Botones normales
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 group"
                >
                  <div className={`
                    transition-all duration-200
                    ${isActive 
                      ? 'text-blue-600 scale-110' 
                      : 'text-gray-500 group-hover:text-blue-600 group-hover:scale-105'
                    }
                  `}>
                    {item.icon}
                  </div>
                  <span className={`
                    text-xs font-medium transition-all duration-200
                    ${isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-500 group-hover:text-blue-600'
                    }
                  `}>
                    {item.label}
                  </span>
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="w-1 h-1 bg-blue-600 rounded-full mt-0.5"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}