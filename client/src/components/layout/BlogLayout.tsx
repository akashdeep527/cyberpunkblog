import { ReactNode, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Menu, X, Github, Twitter, Facebook, Instagram } from "lucide-react";

interface BlogLayoutProps {
  children: ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="min-h-screen bg-darkBg text-cyberText">
      {/* Navigation */}
      <header className="bg-darkerBg border-b border-neonBlue/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/">
              <a className="font-orbitron font-bold text-2xl text-neonPink flex items-center">
                <div className="w-8 h-8 mr-2 flex items-center justify-center">
                  <div className="w-6 h-6 bg-neonPink rotate-45"></div>
                </div>
                <span className="glitch-hover">NeonPulse</span>
              </a>
            </Link>
            
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-cyberText hover:text-neonBlue transition-colors"
              >
                {menuOpen ? <X /> : <Menu />}
              </button>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/">
                <a className="text-cyberText hover:text-neonPink transition-colors">Home</a>
              </Link>
              {categories?.slice(0, 4).map(category => (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <a className="text-cyberText hover:text-neonBlue transition-colors">{category.name}</a>
                </Link>
              ))}
              <Link href="/auth">
                <a className="bg-neonPink/10 border border-neonPink text-neonPink px-4 py-1 rounded hover:bg-neonPink hover:text-white transition-colors">
                  Login
                </a>
              </Link>
            </nav>
          </div>
          
          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden py-4 border-t border-neonBlue/30">
              <nav className="flex flex-col space-y-3">
                <Link href="/">
                  <a className="text-cyberText hover:text-neonPink transition-colors">Home</a>
                </Link>
                {categories?.slice(0, 4).map(category => (
                  <Link key={category.id} href={`/category/${category.slug}`}>
                    <a className="text-cyberText hover:text-neonBlue transition-colors">{category.name}</a>
                  </Link>
                ))}
                <Link href="/auth">
                  <a className="bg-neonPink/10 border border-neonPink text-neonPink px-4 py-1 rounded hover:bg-neonPink hover:text-white transition-colors w-fit">
                    Login
                  </a>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="py-12">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-darkerBg border-t border-neonBlue/30 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link href="/">
                <a className="font-orbitron font-bold text-xl text-neonPink flex items-center">
                  <div className="w-6 h-6 mr-2 flex items-center justify-center">
                    <div className="w-4 h-4 bg-neonPink rotate-45"></div>
                  </div>
                  <span>NeonPulse</span>
                </a>
              </Link>
              <p className="text-cyberText/70 mt-2 text-sm">
                Exploring the digital frontier since 2023
              </p>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="text-cyberText hover:text-neonBlue transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-cyberText hover:text-neonBlue transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-cyberText hover:text-neonBlue transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-cyberText hover:text-neonBlue transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="mt-8 border-t border-neonBlue/10 pt-6 text-center text-cyberText/50 text-sm">
            <p>© {new Date().getFullYear()} NeonPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 