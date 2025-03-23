import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentPosts from "@/components/dashboard/RecentPosts";
import AdSenseManagement from "@/components/dashboard/AdSenseManagement";
import ThemeManagement from "@/components/dashboard/ThemeManagement";
import { Eye, FileText, MessageSquare, DollarSign, Loader2 } from "lucide-react";

export default function DashboardPage() {
  // Fetch stats
  const { 
    data: stats, 
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: ["/api/admin/stats"],
  });
  
  // Fetch posts
  const { 
    data: posts, 
    isLoading: isLoadingPosts,
    error: postsError
  } = useQuery({
    queryKey: ["/api/posts"],
  });
  
  // Fetch adverts
  const { 
    data: adverts, 
    isLoading: isLoadingAdverts,
    error: advertsError
  } = useQuery({
    queryKey: ["/api/admin/adverts"],
  });
  
  // Fetch themes
  const { 
    data: themes, 
    isLoading: isLoadingThemes,
    error: themesError
  } = useQuery({
    queryKey: ["/api/admin/themes"],
  });
  
  const isLoading = isLoadingStats || isLoadingPosts || isLoadingAdverts || isLoadingThemes;
  const hasError = statsError || postsError || advertsError || themesError;
  
  if (isLoading) {
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
          value={stats?.totalViews || 0}
          trend={{ value: "14% from last week", isPositive: true }}
        />
        
        <StatsCard
          icon={<FileText />}
          iconColor="text-neonBlue"
          iconBgColor="bg-neonBlue/10"
          title="Total Posts"
          value={stats?.totalPosts || 0}
          trend={{ value: `${posts?.length || 0} total posts`, isPositive: true }}
        />
        
        <StatsCard
          icon={<MessageSquare />}
          iconColor="text-neonPurple"
          iconBgColor="bg-neonPurple/10"
          title="Comments"
          value={stats?.totalComments || 0}
          trend={{ 
            value: `${stats?.pendingComments || 0} need approval`, 
            isPositive: false, 
            isWarning: true 
          }}
        />
        
        <StatsCard
          icon={<DollarSign />}
          iconColor="text-neonGreen"
          iconBgColor="bg-neonGreen/10"
          title="Ad Revenue"
          value={stats?.formattedRevenue || "$0.00"}
          trend={{ value: "3% from last month", isPositive: false }}
        />
      </div>
      
      {/* Recent Posts & AdSense */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <RecentPosts posts={posts || []} />
        
        <AdSenseManagement 
          adverts={adverts || []} 
          revenue={stats?.totalAdRevenue || 0} 
        />
      </div>
      
      {/* Theme Management */}
      <ThemeManagement themes={themes || []} />
    </AdminLayout>
  );
}
