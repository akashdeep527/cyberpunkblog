import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Post, Category } from "@shared/schema";
import { useTheme } from "@/hooks/use-theme";
import { useAdsense } from "@/hooks/use-adsense";
import { 
  Eye, 
  Calendar, 
  MessageSquare, 
  ChevronRight, 
  Search,
  Loader2,
  Menu,
  X,
  Github,
  Twitter,
  Facebook,
  Instagram
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CyberBorder from "@/components/shared/CyberBorder";
import { format } from "date-fns";

export default function BlogPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();
  const { adverts } = useAdsense();
  
  // Fetch posts
  const { data: posts, isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });
  
  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Filter posts based on search query
  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Find sidebar ad
  const sidebarAd = adverts?.find(ad => ad.position === "sidebar" && ad.enabled);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality is handled through the filteredPosts
  };
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
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
      
      {/* Hero Section */}
      <section className="relative py-16 bg-darkBg overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#05d9e833_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-orbitron text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-neonPink glitch-hover leading-tight">
              Explore the Cyberpunk Future
            </h1>
            <p className="text-xl mb-8 text-cyberText/80">
              Dive into a world of neon-lit streets, advanced technology, and digital rebellion.
            </p>
            <form onSubmit={handleSearch} className="flex items-center max-w-md mx-auto">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-darkerBg border border-neonBlue/30 rounded-l py-2 px-4 w-full text-cyberText placeholder-mutedText focus:border-neonBlue focus:shadow-neon-blue"
                />
                <Search className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-mutedText" />
              </div>
              <Button 
                type="submit" 
                className="bg-neonBlue text-darkBg font-semibold py-2 px-4 rounded-r hover:bg-neonBlue/80 transition-colors"
              >
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Blog Posts */}
            <div className="lg:w-2/3">
              {isLoadingPosts ? (
                <div className="flex items-center justify-center min-h-[300px]">
                  <Loader2 className="h-8 w-8 text-neonBlue animate-spin" />
                </div>
              ) : filteredPosts?.length === 0 ? (
                <div className="text-center p-10 bg-darkerBg rounded-lg border border-neonBlue/30">
                  <p className="text-mutedText">No posts found.</p>
                </div>
              ) : (
                <>
                  {/* Featured Post */}
                  {filteredPosts && filteredPosts[0] && (
                    <CyberBorder className="rounded-lg overflow-hidden mb-8">
                      <div className="relative">
                        <img 
                          src={filteredPosts[0].featuredImage || "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1000&h=500"}
                          alt={filteredPosts[0].title}
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-darkerBg to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6">
                          <div className="bg-neonPink/10 text-neonPink text-xs px-2 py-1 rounded mb-2 inline-block">
                            Featured
                          </div>
                          <h2 className="font-orbitron text-2xl md:text-3xl font-bold mb-2 text-white">
                            {filteredPosts[0].title}
                          </h2>
                          <div className="flex items-center text-xs text-mutedText">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" /> 
                              <span>{format(new Date(filteredPosts[0].createdAt), 'MMM d, yyyy')}</span>
                            </span>
                            <span className="mx-2">•</span>
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" /> 
                              <span>{filteredPosts[0].views}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-darkerBg p-6">
                        <p className="text-cyberText/80 mb-4">
                          {filteredPosts[0].excerpt || filteredPosts[0].content.replace(/<[^>]*>/g, '').slice(0, 150) + '...'}
                        </p>
                        <Link href={`/post/${filteredPosts[0].slug}`}>
                          <a className="text-neonBlue hover:text-neonBlue/80 flex items-center font-medium">
                            Read more <ChevronRight className="h-4 w-4 ml-1" />
                          </a>
                        </Link>
                      </div>
                    </CyberBorder>
                  )}
                  
                  {/* Post Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredPosts?.slice(1).map((post) => (
                      <CyberBorder key={post.id} className="rounded-lg overflow-hidden">
                        <div className="relative">
                          <img 
                            src={post.featuredImage || "https://images.unsplash.com/photo-1545486332-9e0999c535b2?auto=format&fit=crop&w=500&h=300"}
                            alt={post.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-darkerBg to-transparent"></div>
                        </div>
                        <div className="bg-darkerBg p-4">
                          <h3 className="font-orbitron text-xl font-bold mb-2 hover:text-neonPink transition-colors">
                            <Link href={`/post/${post.slug}`}>
                              <a>{post.title}</a>
                            </Link>
                          </h3>
                          <div className="flex items-center text-xs text-mutedText mb-2">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" /> 
                              <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                            </span>
                            <span className="mx-2">•</span>
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" /> 
                              <span>{post.views}</span>
                            </span>
                            <span className="mx-2">•</span>
                            <span className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" /> 
                              <span>0</span>
                            </span>
                          </div>
                          <p className="text-cyberText/80 text-sm mb-3 line-clamp-3">
                            {post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 120) + '...'}
                          </p>
                          <Link href={`/post/${post.slug}`}>
                            <a className="text-neonBlue text-sm hover:text-neonBlue/80 flex items-center">
                              Read more <ChevronRight className="h-3 w-3 ml-1" />
                            </a>
                          </Link>
                        </div>
                      </CyberBorder>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="lg:w-1/3">
              {/* About Box */}
              <CyberBorder className="rounded-lg bg-darkerBg p-6 mb-6">
                <h3 className="font-orbitron text-xl text-neonPink mb-3">About NeonPulse</h3>
                <p className="text-cyberText/80 mb-4">
                  NeonPulse is your window into the cyberpunk world. We explore technology, future society, and the digital underground.
                </p>
                <div className="flex space-x-3">
                  <a href="#" className="text-neonBlue hover:text-neonBlue/80 transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-neonBlue hover:text-neonBlue/80 transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-neonBlue hover:text-neonBlue/80 transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-neonBlue hover:text-neonBlue/80 transition-colors">
                    <Github className="h-5 w-5" />
                  </a>
                </div>
              </CyberBorder>
              
              {/* Categories */}
              <CyberBorder className="rounded-lg bg-darkerBg p-6 mb-6">
                <h3 className="font-orbitron text-xl text-neonPink mb-3">Categories</h3>
                {isLoadingCategories ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 text-neonBlue animate-spin" />
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {categories?.map((category) => (
                      <li key={category.id}>
                        <Link href={`/category/${category.slug}`}>
                          <a className="flex items-center justify-between py-2 border-b border-neonBlue/10 hover:text-neonBlue transition-colors">
                            <span>{category.name}</span>
                            <ChevronRight className="h-4 w-4" />
                          </a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CyberBorder>
              
              {/* AdSense */}
              {sidebarAd && (
                <div className="mb-6">
                  <div className="bg-darkerBg p-2 rounded-lg border border-neonPurple/30 text-center">
                    <div 
                      className="bg-darkBg p-4 rounded flex items-center justify-center h-[250px]"
                      dangerouslySetInnerHTML={{ __html: sidebarAd.code }}
                    >
                    </div>
                  </div>
                </div>
              )}
              
              {/* Popular Posts */}
              <CyberBorder className="rounded-lg bg-darkerBg p-6">
                <h3 className="font-orbitron text-xl text-neonPink mb-3">Popular Posts</h3>
                {isLoadingPosts ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 text-neonBlue animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts?.slice(0, 3).sort((a, b) => b.views - a.views).map((post) => (
                      <div key={post.id} className="flex items-start">
                        <img 
                          src={post.featuredImage || "https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?auto=format&fit=crop&w=100&h=100"}
                          alt={post.title}
                          className="w-16 h-16 object-cover rounded mr-3"
                        />
                        <div>
                          <h4 className="font-semibold hover:text-neonPink transition-colors line-clamp-2">
                            <Link href={`/post/${post.slug}`}>
                              <a>{post.title}</a>
                            </Link>
                          </h4>
                          <div className="flex items-center text-xs text-mutedText mt-1">
                            <Calendar className="h-3 w-3 mr-1" /> 
                            <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CyberBorder>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-darkerBg border-t border-neonBlue/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link href="/">
                <a className="font-orbitron font-bold text-xl text-neonPink">NeonPulse</a>
              </Link>
              <p className="text-mutedText text-sm mt-1">
                Exploring the cyberpunk frontier since 2023
              </p>
            </div>
            
            <div className="flex space-x-6 items-center">
              <a href="#" className="text-mutedText hover:text-neonBlue transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-mutedText hover:text-neonBlue transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-mutedText hover:text-neonBlue transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-mutedText hover:text-neonBlue transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-neonBlue/10 text-center text-mutedText text-sm">
            <p>© {new Date().getFullYear()} NeonPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
