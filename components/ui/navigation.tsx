'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck, Users, Calendar, Server, Search, BookOpen, Menu, X, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const navigation = [
    { name: 'Home', href: '/', icon: Truck },
    { name: 'Servers', href: '/servers', icon: Server },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'News', href: '/news', icon: Newspaper },
    { name: 'VTCs', href: '/vtcs', icon: Users },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Rules', href: '/rules', icon: BookOpen },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-black/98 backdrop-blur-xl shadow-2xl border-b border-white/5" 
            : "bg-black/90 backdrop-blur-md border-b-2 border-white/10"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-3 group relative"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="relative">
                <Truck className="w-8 h-8 md:w-10 md:h-10 text-red-500 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-red-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-white tracking-tight">
                TruckersMP
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'relative flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden',
                      isActive 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30' 
                        : 'text-gray-300 hover:text-white'
                    )}
                  >
                    {/* Hover background effect */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    )}
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/50" />
                    )}
                    
                    <Icon className={cn(
                      "w-5 h-5 transition-all duration-300",
                      isActive && "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]",
                      !isActive && "group-hover:scale-110 group-hover:rotate-3"
                    )} />
                    <span className={cn(
                      "font-medium transition-all duration-300",
                      !isActive && "group-hover:translate-x-0.5"
                    )}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative p-2.5 text-gray-300 hover:text-white rounded-lg transition-all duration-300 hover:bg-white/10"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <Menu 
                  className={cn(
                    "absolute inset-0 w-6 h-6 transition-all duration-300",
                    isMobileMenuOpen ? "opacity-0 rotate-180" : "opacity-100"
                  )} 
                />
                <X 
                  className={cn(
                    "absolute inset-0 w-6 h-6 transition-all duration-300",
                    isMobileMenuOpen ? "opacity-100" : "opacity-0 -rotate-180"
                  )} 
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-500",
          isMobileMenuOpen ? "visible" : "invisible"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500",
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={cn(
            "absolute inset-x-4 top-20 bottom-4 max-w-md mx-auto bg-black/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl transition-all duration-500 overflow-hidden",
            isMobileMenuOpen 
              ? "opacity-100 scale-100 translate-y-0" 
              : "opacity-0 scale-95 -translate-y-4"
          )}
        >
          <div className="flex flex-col h-full p-2">
            {/* Navigation Items Mobile */}
            <div className="flex-1 overflow-y-auto">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-4 px-6 py-4 rounded-xl transition-all duration-300 relative overflow-hidden group',
                      isActive 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    )}
                    style={{
                      transitionDelay: `${index * 50}ms`,
                      transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                      opacity: isMobileMenuOpen ? 1 : 0,
                    }}
                  >
                    {/* Hover effect */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-active:translate-x-[100%] transition-transform duration-700" />
                    )}
                    
                    <Icon className={cn(
                      "w-6 h-6 transition-transform duration-300",
                      isActive && "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]",
                      !isActive && "group-active:scale-110"
                    )} />
                    <span className="font-medium text-lg">{item.name}</span>
                    
                    {isActive && (
                      <div className="absolute right-4 w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Menu Footer */}
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="text-center text-gray-500 text-sm">
                © 2025 TruckersMP
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}