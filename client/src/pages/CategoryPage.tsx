import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import BlogLayout from "@/components/layout/BlogLayout";
import PostCard from "@/components/blog/PostCard";
import { Post, Category } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const categorySlug = params?.slug;
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  
  // Fetch all posts
  const { 
    data: posts, 
    isLoading: isLoadingPosts,
    error: postsError 
  } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });
  
  // Fetch all categories to get the current category details
  const { 
    data: categories, 
    isLoading: isLoadingCategories,
    error: categoriesError 
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  const isLoading = isLoadingPosts || isLoadingCategories;
  const error = postsError || categoriesError;
  
  // Find the current category
  const currentCategory = categories?.find(cat => cat.slug === categorySlug);

  // Filter posts manually by fetching categories for each post
  useEffect(() => {
    const filterPosts = async () => {
      if (!posts || !currentCategory) return;
      
      const postsInCategory: Post[] = [];
      
      // For each post, fetch its categories and check if current category is included
      for (const post of posts) {
        const response = await fetch(`/api/posts/${post.id}/categories`);
        if (response.ok) {
          const postCategories: Category[] = await response.json();
          // If post belongs to current category, add it to filtered posts
          if (postCategories.some(cat => cat.id === currentCategory.id)) {
            postsInCategory.push(post);
          }
        }
      }
      
      setFilteredPosts(postsInCategory);
    };
    
    if (posts && currentCategory) {
      filterPosts();
    }
  }, [posts, currentCategory]);
  
  if (isLoading) {
    return (
      <BlogLayout>
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-neonBlue" />
        </div>
      </BlogLayout>
    );
  }
  
  if (error || !currentCategory) {
    return (
      <BlogLayout>
        <div className="text-center p-8 bg-darkBg rounded-lg border border-dangerRed/30">
          <h1 className="text-xl text-dangerRed font-orbitron mb-4">
            404 Page Not Found
          </h1>
          <p className="text-cyberText">
            Did you forget to add the page to the router?
          </p>
        </div>
      </BlogLayout>
    );
  }
  
  return (
    <BlogLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-orbitron text-neonPink mb-2">
          Category: {currentCategory.name}
        </h1>
        <div className="h-1 w-20 bg-neonBlue mb-6"></div>
      </div>
      
      {filteredPosts && filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center p-6 bg-darkBg rounded-lg">
          <p className="text-mutedText">No posts found in this category.</p>
        </div>
      )}
    </BlogLayout>
  );
} 