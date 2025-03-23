import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../hooks/use-auth";
import { 
  LayoutDashboard, 
  FileText, 
  Image, 
  Copy, 
  MessageSquare, 
  Palette, 
  PlugZap, 
  Users, 
  Settings, 
  ExternalLink, 
  Menu, 
  Bell, 
  Search, 
  Plus 
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { cn } from "../../lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = "Dashboard" }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navItems = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Posts", path: "/admin/posts", icon: <FileText className="w-5 h-5" /> },
    { name: "Media", path: "/admin/media", icon: <Image className="w-5 h-5" /> },
    { name: "Pages", path: "/admin/pages", icon: <Copy className="w-5 h-5" /> },
    { name: "Comments", path: "/admin/comments", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Appearance", path: "/admin/appearance", icon: <Palette className="w-5 h-5" /> },
    { name: "Plugins", path: "/admin/plugins", icon: <PlugZap className="w-5 h-5" /> },
    { name: "Users", path: "/admin/users", icon: <Users className="w-5 h-5" /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-darkBg text-cyberText">
      {/* Sidebar Navigation */}
      <div 
        className={cn(
          "bg-darkerBg border-r border-neonBlue/30 shadow-lg transition-all duration-200",
          sidebarOpen ? "w-64" : "w-0 -ml-64 md:w-20 md:ml-0"
        )}
      >
        <div className="p-4 mb-6">
          <h1 className="font-orbitron font-bold text-2xl text-neonPink flex items-center">
            <div className="w-8 h-8 mr-2 flex items-center justify-center">
              <div className="w-6 h-6 bg-neonPink rotate-45"></div>
            </div>
            {sidebarOpen && <span className="glitch-hover">NeonPulse</span>}
          </h1>
          {sidebarOpen && <p className="text-xs text-mutedText mt-1">Admin Dashboard</p>}
        </div>
        
        <nav className="px-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.name} className="mb-3">
                <Link href={item.path}>
                  <a 
                    className={cn(
                      "flex items-center p-2 rounded transition-all duration-200",
                      location === item.path
                        ? "bg-neonPink/10 text-neonPink border-l-2 border-neonPink"
                        : "hover:bg-darkBg/50 hover:text-neonBlue"
                    )}
                  >
                    <span className="w-5 flex justify-center">{item.icon}</span>
                    {sidebarOpen && <span className="ml-2">{item.name}</span>}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 bg-darkerBg border-t border-neonBlue/30">
          <Link href="/">
            <a className="flex items-center text-sm hover:text-neonBlue transition-all duration-200">
              <ExternalLink className="w-4 h-4 mr-2" />
              {sidebarOpen && <span>View Site</span>}
            </a>
          </Link>
          
          {sidebarOpen && (
            <div className="flex items-center mt-3">
              <Avatar className="border border-neonPurple w-8 h-8">
                <AvatarImage src={`https://avatars.dicebear.com/api/identicon/${user?.username || 'admin'}.svg`} />
                <AvatarFallback className="bg-darkerBg text-neonPink">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2">
                <p className="text-sm">{user?.username || 'Admin'}</p>
                <button 
                  onClick={handleLogout} 
                  className="text-xs text-neonPink hover:text-neonPink/75 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-auto">
        {/* Admin Header */}
        <header className="bg-darkerBg border-b border-neonBlue/30 py-2 px-6 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="mr-4 text-mutedText hover:text-neonBlue transition-all duration-200"
            >
              <Menu />
            </button>
            <h2 className="font-orbitron text-lg">{title}</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-mutedText hover:text-neonBlue transition-all duration-200 relative">
              <Bell />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-neonPink"></span>
            </button>
            
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search..." 
                className="bg-darkBg border border-neonBlue/30 rounded py-1 px-3 text-sm text-cyberText placeholder-mutedText focus:border-neonBlue focus:shadow-neon-blue w-40 md:w-auto"
              />
              <Search className="h-4 w-4 absolute right-3 top-2 text-mutedText" />
            </div>
            
            <Link href="/admin/posts/new">
              <Button className="bg-neonPink text-white hover:bg-neonPink/80">
                <Plus className="h-4 w-4 mr-1" /> New Post
              </Button>
            </Link>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
