'use client';

import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Calculator, BookOpen, Home } from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      {/* Top header strip */}
      <div className="w-full bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700 h-1"></div>
      
      {/* Main navbar */}
      <nav className="w-full flex justify-center py-4 px-4">
        <div className="max-w-7xl w-full flex items-center justify-between bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="GryphonGrade Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:inline">GryphonGrade</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className={`text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all ${
                pathname === '/' ? 'text-indigo-600 bg-indigo-50' : ''
              }`}
            >
              <Home className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                const searchInput = document.getElementById('search-input');
                if (searchInput && pathname === '/') {
                  searchInput.focus();
                } else {
                  router.push('/');
                  setTimeout(() => {
                    document.getElementById('search-input')?.focus();
                  }, 100);
                }
              }}
              className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Browse Courses</span>
            </Button>
            {pathname.startsWith('/course/') && (
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <Calculator className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Calculator</span>
              </Button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
