import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentPosts from "@/components/dashboard/RecentPosts";
import AdSenseManagement from "@/components/dashboard/AdSenseManagement";
import ThemeManagement from "@/components/dashboard/ThemeManagement";
import { Eye, FileText, MessageSquare, DollarSign, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Post, Advert, Theme } from "@shared/schema";

// Define Stats interface
interface EnhancedStats {
  id: number;
  totalViews: number;
  totalAdRevenue: number;
  updatedAt: Date;
  totalPosts: number;
  totalComments: number;
  pendingComments: number;
  formattedRevenue: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Fetch stats
  const { 
    data: stats, 
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useQuery<EnhancedStats>({
    queryKey: ["/api/admin/stats"],
    retry: 1,
    enabled: !!user?.isAdmin
  });
  
  // Fetch posts
  const { 
    data: posts, 
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts
  } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    retry: 1
  });
  
  // Fetch adverts
  const { 
    data: adverts, 
    isLoading: isLoadingAdverts,
    error: advertsError,
    refetch: refetchAdverts
  } = useQuery<Advert[]>({
    queryKey: ["/api/admin/adverts"],
    retry: 1,
    enabled: !!user?.isAdmin
  });
  
  // Fetch themes
  const { 
    data: themes, 
    isLoading: isLoadingThemes,
    error: themesError,
    refetch: refetchThemes
  } = useQuery<Theme[]>({
    queryKey: ["/api/admin/themes"],
    retry: 1,
    enabled: !!user?.isAdmin
  });
  
  // Retry fetching data if there was an error
  useEffect(() => {
    if (statsError || postsError || advertsError || themesError) {
      const timer = setTimeout(() => {
        if (statsError) refetchStats();
        if (postsError) refetchPosts();
        if (advertsError) refetchAdverts();
        if (themesError) refetchThemes();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [statsError, postsError, advertsError, themesError, refetchStats, refetchPosts, refetchAdverts, refetchThemes]);
  
  const isLoading = isLoadingStats || isLoadingPosts || isLoadingAdverts || isLoadingThemes;
  const hasError = statsError || postsError || advertsError || themesError;
  
  // Safe default data
  const safeStats: EnhancedStats = stats || {
    id: 0,
    totalViews: 0,
    totalAdRevenue: 0,
    updatedAt: new Date(),
    totalPosts: 0,
    totalComments: 0,
    pendingComments: 0,
    formattedRevenue: "$0.00"
  };
  
  const safePosts: Post[] = posts || [];
  const safeAdverts: Advert[] = adverts || [];
  const safeThemes: Theme[] = themes || [];
  
  if (isLoading && !hasError) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 text-neonBlue animate-spin" />
        </div>
      </AdminLayout>
    );
  }
  
  if (hasError) {
    return (
      <AdminLayout>
        <div className="text-center py-8 text-dangerRed">
          <p>Error loading dashboard data. Please try again later.</p>
          <button 
            onClick={() => {
              refetchStats();
              refetchPosts();
              refetchAdverts();
              refetchThemes();
            }}
            className="mt-4 px-4 py-2 bg-neonBlue text-white rounded hover:bg-neonBlue/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={<Eye />}
          iconColor="text-neonPink"
          iconBgColor="bg-neonPink/10"
          title="Total Views"
          value={safeStats.totalViews}
          trend={{ value: "14% from last week", isPositive: true }}
        />
        
        <StatsCard
          icon={<FileText />}
          iconColor="text-neonBlue"
          iconBgColor="bg-neonBlue/10"
          title="Total Posts"
          value={safeStats.totalPosts}
          trend={{ value: `${safePosts.length} total posts`, isPositive: true }}
        />
        
        <StatsCard
          icon={<MessageSquare />}
          iconColor="text-neonPurple"
          iconBgColor="bg-neonPurple/10"
          title="Comments"
          value={safeStats.totalComments}
          trend={{ 
            value: `${safeStats.pendingComments} need approval`, 
            isPositive: false, 
            isWarning: true 
          }}
        />
        
        <StatsCard
          icon={<DollarSign />}
          iconColor="text-neonGreen"
          iconBgColor="bg-neonGreen/10"
          title="Ad Revenue"
          value={safeStats.formattedRevenue}
          trend={{ value: "3% from last month", isPositive: false }}
        />
      </div>
      
      {/* Recent Posts & AdSense */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <RecentPosts posts={safePosts} />
        
        <AdSenseManagement 
          adverts={safeAdverts} 
          revenue={safeStats.totalAdRevenue} 
        />
      </div>
      
      {/* Theme Management */}
      <ThemeManagement themes={safeThemes} />
    </AdminLayout>
  );
}
