import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Post, Category, Tag, Comment, InsertComment, insertCommentSchema } from "@shared/schema";
import { useTheme } from "@/hooks/use-theme";
import { useAdsense } from "@/hooks/use-adsense";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CyberBorder from "@/components/shared/CyberBorder";
import { 
  Eye, 
  Calendar, 
  MessageSquare, 
  ChevronRight, 
  ChevronLeft,
  Share,
  Menu,
  X,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export default function SinglePostPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const params = useParams<{ slug: string }>();
  const { slug } = params;
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { theme } = useTheme();
  const { adverts } = useAdsense();
  
  // Fetch the post
  const { 
    data: post, 
    isLoading: isLoadingPost,
    error: postError 
  } = useQuery<Post>({
    queryKey: [`/api/posts/slug/${slug}`],
  });
  
  // Fetch categories for the post
  const { data: postCategories } = useQuery<Category[]>({
    queryKey: [`/api/posts/${post?.id}/categories`],
    enabled: !!post?.id,
  });
  
  // Fetch tags for the post
  const { data: postTags } = useQuery<Tag[]>({
    queryKey: [`/api/posts/${post?.id}/tags`],
    enabled: !!post?.id,
  });
  
  // Fetch comments for the post
  const { 
    data: comments, 
    isLoading: isLoadingComments 
  } = useQuery<Comment[]>({
    queryKey: [`/api/posts/${post?.id}/comments`],
    enabled: !!post?.id,
  });
  
  // Find content ad
  const contentAd = adverts?.find(ad => ad.position === "content" && ad.enabled);
  
  // Setup form for comments
  const form = useForm<InsertComment>({
    resolver: zodResolver(insertCommentSchema),
    defaultValues: {
      content: "",
      author: "",
      email: "",
      postId: post?.id || 0
    },
  });
  
  // Update postId when post is loaded
  useEffect(() => {
    if (post?.id) {
      form.setValue("postId", post.id);
    }
  }, [post, form]);
  
  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (comment: InsertComment) => {
      return apiRequest("POST", `/api/posts/${post!.id}/comments`, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post!.id}/comments`] });
      toast({
        title: "Comment submitted",
        description: "Your comment has been submitted for approval.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit comment: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Submit comment
  const onSubmit = (data: InsertComment) => {
    commentMutation.mutate(data);
  };
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  
  if (isLoadingPost) {
    return (
      <div className="min-h-screen bg-darkBg text-cyberText flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-neonBlue animate-spin" />
      </div>
    );
  }
  
  if (postError || !post) {
    return (
      <div className="min-h-screen bg-darkBg text-cyberText flex items-center justify-center">
        <div className="text-center">
          <p className="text-dangerRed mb-4">Post not found or error loading content.</p>
          <Link href="/">
            <Button className="bg-neonPink text-white hover:bg-neonPink/80">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
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
              {postCategories?.slice(0, 4).map(category => (
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
                {postCategories?.slice(0, 4).map(category => (
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
      
      {/* Post Header */}
      <section className="relative py-16 bg-darkBg overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#05d9e833_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center space-x-2 mb-4 text-sm">
              <Link href="/">
                <a className="text-mutedText hover:text-neonBlue transition-colors">Home</a>
              </Link>
              <ChevronRight className="h-4 w-4 text-mutedText" />
              {postCategories?.[0] && (
                <>
                  <Link href={`/category/${postCategories[0].slug}`}>
                    <a className="text-mutedText hover:text-neonBlue transition-colors">
                      {postCategories[0].name}
                    </a>
                  </Link>
                  <ChevronRight className="h-4 w-4 text-mutedText" />
                </>
              )}
              <span className="text-neonPink">{post.title}</span>
            </div>
            
            <h1 className="font-orbitron text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-neonPink leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-mutedText mb-6">
              <div className="flex items-center mr-4 mb-2">
                <Calendar className="h-4 w-4 mr-1" /> 
                <span>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center mr-4 mb-2">
                <Eye className="h-4 w-4 mr-1" /> 
                <span>{post.views} views</span>
              </div>
              <div className="flex items-center mb-2">
                <MessageSquare className="h-4 w-4 mr-1" /> 
                <span>{comments?.length || 0} comments</span>
              </div>
              
              {/* Categories */}
              {postCategories && postCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 ml-auto mb-2">
                  {postCategories.map(category => (
                    <Link key={category.id} href={`/category/${category.slug}`}>
                      <a className="bg-neonPurple/20 text-neonPurple text-xs py-1 px-2 rounded hover:bg-neonPurple/30 transition-colors">
                        {category.name}
                      </a>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Article */}
            <article className="lg:w-2/3">
              <CyberBorder className="rounded-lg overflow-hidden mb-8">
                {post.featuredImage && (
                  <div className="mb-6">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
                
                <div className="bg-darkerBg p-6">
                  {/* Post Content */}
                  <div 
                    className="prose prose-invert max-w-none mb-8 cyber-prose" 
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                  
                  {/* Tags */}
                  {postTags && postTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6 mt-8 pt-6 border-t border-neonBlue/10">
                      <span className="text-mutedText">Tags:</span>
                      {postTags.map(tag => (
                        <Link key={tag.id} href={`/tag/${tag.slug}`}>
                          <a className="bg-neonBlue/20 text-neonBlue text-xs py-1 px-2 rounded hover:bg-neonBlue/30 transition-colors">
                            {tag.name}
                          </a>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {/* Share */}
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="text-mutedText">Share:</span>
                    <a 
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-darkBg p-2 rounded-full text-neonBlue hover:bg-neonBlue/10 transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-darkBg p-2 rounded-full text-neonBlue hover:bg-neonBlue/10 transition-colors"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                    <a 
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-darkBg p-2 rounded-full text-neonBlue hover:bg-neonBlue/10 transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a 
                      href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(window.location.href)}`}
                      className="bg-darkBg p-2 rounded-full text-neonBlue hover:bg-neonBlue/10 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CyberBorder>
              
              {/* AdSense - Content Ad */}
              {contentAd && (
                <div className="mb-8">
                  <div className="bg-darkerBg p-2 rounded-lg border border-neonPurple/30 text-center">
                    <div 
                      className="bg-darkBg p-4 rounded flex items-center justify-center h-[90px]"
                      dangerouslySetInnerHTML={{ __html: contentAd.code }}
                    >
                    </div>
                  </div>
                </div>
              )}
              
              {/* Comments Section */}
              <CyberBorder className="rounded-lg bg-darkerBg p-6 mb-8">
                <h3 className="font-orbitron text-xl text-neonPink mb-4">
                  Comments ({comments?.length || 0})
                </h3>
                
                {isLoadingComments ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 text-neonBlue animate-spin" />
                  </div>
                ) : comments?.length === 0 ? (
                  <div className="text-center p-6 text-mutedText">
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6">
                    {comments?.map((comment) => (
                      <div key={comment.id} className="border-b border-neonBlue/10 pb-4 last:border-0">
                        <div className="flex items-start">
                          <div className="bg-darkBg rounded-full w-10 h-10 flex items-center justify-center text-neonPurple mr-3">
                            <span className="font-orbitron">
                              {comment.author.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-semibold mr-2">{comment.author}</h4>
                              <span className="text-xs text-mutedText">
                                {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <p className="mt-1 text-cyberText/80">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Comment Form */}
                <div className="pt-4 border-t border-neonBlue/10">
                  <h4 className="font-orbitron text-lg text-neonBlue mb-4">Leave a comment</h4>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comment</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter your comment here..." 
                                className="bg-darkBg border border-neonBlue/30 min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="author"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your name" 
                                  className="bg-darkBg border border-neonBlue/30"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="Your email" 
                                  className="bg-darkBg border border-neonBlue/30"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="bg-neonPink text-white hover:bg-neonPink/80"
                        disabled={commentMutation.isPending}
                      >
                        {commentMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : "Submit Comment"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </CyberBorder>
            </article>
            
            {/* Sidebar */}
            <aside className="lg:w-1/3 space-y-6">
              {/* Author Bio */}
              <CyberBorder className="rounded-lg bg-darkerBg p-6">
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
                </div>
              </CyberBorder>
              
              {/* Categories */}
              <CyberBorder className="rounded-lg bg-darkerBg p-6">
                <h3 className="font-orbitron text-xl text-neonPink mb-3">Categories</h3>
                {postCategories && (
                  <ul className="space-y-2">
                    {postCategories.map((category) => (
                      <li key={category.id}>
                        <Link href={`/category/${category.slug}`}>
                          <a className="flex items-center justify-between py-2 border-b border-neonBlue/10 hover:text-neonBlue transition-colors">
                            <span>{category.name}</span>
                            <ChevronRight className="h-4 w-4" />
                          </a>
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link href="/">
                        <a className="flex items-center justify-between py-2 border-b border-neonBlue/10 hover:text-neonBlue transition-colors">
                          <span>View All Categories</span>
                          <ChevronRight className="h-4 w-4" />
                        </a>
                      </Link>
                    </li>
                  </ul>
                )}
              </CyberBorder>
              
              {/* Tags */}
              {postTags && postTags.length > 0 && (
                <CyberBorder className="rounded-lg bg-darkerBg p-6">
                  <h3 className="font-orbitron text-xl text-neonPink mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {postTags.map((tag) => (
                      <Link key={tag.id} href={`/tag/${tag.slug}`}>
                        <a className="bg-neonBlue/20 text-neonBlue text-xs py-1 px-2 rounded hover:bg-neonBlue/30 transition-colors">
                          {tag.name}
                        </a>
                      </Link>
                    ))}
                  </div>
                </CyberBorder>
              )}
              
              {/* Back to Blog */}
              <CyberBorder className="rounded-lg bg-darkerBg p-6">
                <Link href="/">
                  <a className="flex items-center text-neonBlue hover:text-neonBlue/80 transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Blog
                  </a>
                </Link>
              </CyberBorder>
            </aside>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-darkerBg border-t border-neonBlue/30 py-8 mt-8">
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
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-neonBlue/10 text-center text-mutedText text-sm">
            <p>© {new Date().getFullYear()} NeonPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <style jsx global>{`
        .cyber-prose {
          --tw-prose-body: #caf3f3;
          --tw-prose-headings: #ff2a6d;
          --tw-prose-lead: #05d9e8;
          --tw-prose-links: #05d9e8;
          --tw-prose-bold: #caf3f3;
          --tw-prose-counters: #9d4edd;
          --tw-prose-bullets: #9d4edd;
          --tw-prose-hr: rgba(5, 217, 232, 0.3);
          --tw-prose-quotes: #ff2a6d;
          --tw-prose-quote-borders: #9d4edd;
          --tw-prose-captions: #adb5bd;
          --tw-prose-code: #39ff14;
          --tw-prose-pre-code: #39ff14;
          --tw-prose-pre-bg: #01012b;
          --tw-prose-th-borders: rgba(5, 217, 232, 0.3);
          --tw-prose-td-borders: rgba(5, 217, 232, 0.2);
        }
        
        .cyber-prose h1, .cyber-prose h2, .cyber-prose h3, .cyber-prose h4 {
          font-family: 'Orbitron', sans-serif;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        
        .cyber-prose code {
          font-family: 'Share Tech Mono', monospace;
          background-color: #01012b;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
        }
        
        .cyber-prose pre {
          background-color: #01012b;
          border-radius: 0.375rem;
          padding: 1em;
        }
        
        .cyber-prose blockquote {
          border-left-color: #9d4edd;
          color: #ff2a6d;
          font-style: italic;
        }
        
        .cyber-prose a {
          text-decoration-color: #05d9e8;
          text-decoration-thickness: 2px;
          font-weight: 500;
        }
        
        .cyber-prose a:hover {
          text-decoration: none;
          background-color: rgba(5, 217, 232, 0.1);
        }
      `}</style>
    </div>
  );
}
