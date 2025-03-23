import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import PostEditor from "@/components/editor/PostEditor";
import { Loader2 } from "lucide-react";

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const isEditMode = params && params.id;
  
  // Fetch post if in edit mode
  const { 
    data: post, 
    isLoading: isLoadingPost, 
    error: postError 
  } = useQuery({
    queryKey: isEditMode ? [`/api/posts/${params.id}`] : null,
    enabled: !!isEditMode,
  });
  
  // Fetch categories
  const { 
    data: categories, 
    isLoading: isLoadingCategories, 
    error: categoriesError 
  } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  // Fetch tags
  const { 
    data: tags, 
    isLoading: isLoadingTags, 
    error: tagsError 
  } = useQuery({
    queryKey: ["/api/tags"],
  });
  
  // Fetch post categories if in edit mode
  const { 
    data: postCategories, 
    isLoading: isLoadingPostCategories 
  } = useQuery({
    queryKey: isEditMode ? [`/api/posts/${params.id}/categories`] : null,
    enabled: !!isEditMode,
  });
  
  // Fetch post tags if in edit mode
  const { 
    data: postTags, 
    isLoading: isLoadingPostTags 
  } = useQuery({
    queryKey: isEditMode ? [`/api/posts/${params.id}/tags`] : null,
    enabled: !!isEditMode,
  });
  
  const isLoading = 
    (isEditMode && (isLoadingPost || isLoadingPostCategories || isLoadingPostTags)) || 
    isLoadingCategories || 
    isLoadingTags;
  
  const hasError = postError || categoriesError || tagsError;
  
  if (isLoading) {
    return (
      <AdminLayout title={isEditMode ? "Edit Post" : "Create New Post"}>
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 text-neonBlue animate-spin" />
        </div>
      </AdminLayout>
    );
  }
  
  if (hasError) {
    return (
      <AdminLayout title={isEditMode ? "Edit Post" : "Create New Post"}>
        <div className="text-center py-8 text-dangerRed">
          <p>Error loading data. Please try again later.</p>
        </div>
      </AdminLayout>
    );
  }
  
  if (isEditMode && !post) {
    return (
      <AdminLayout title="Edit Post">
        <div className="text-center py-8 text-dangerRed">
          <p>Post not found.</p>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title={isEditMode ? "Edit Post" : "Create New Post"}>
      <PostEditor 
        post={post} 
        categories={categories || []} 
        tags={tags || []} 
        postCategories={postCategories || []} 
        postTags={postTags || []} 
      />
    </AdminLayout>
  );
}
