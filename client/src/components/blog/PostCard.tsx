import { Link } from "wouter";
import { Post } from "@shared/schema";
import { Eye, Calendar, MessageSquare, ChevronRight } from "lucide-react";
import CyberBorder from "@/components/shared/CyberBorder";
import { format } from "date-fns";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <CyberBorder className="rounded-lg overflow-hidden">
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
  );
} 