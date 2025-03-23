import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "../components/layout/AdminLayout";
import PageHeader from "../components/dashboard/PageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "../components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import { Loader2, Search, Check, X, MessageSquare, ExternalLink, Eye } from "lucide-react";

// Define Comment type
interface Comment {
  id: number;
  content: string;
  author: string;
  email: string;
  postId: number;
  postTitle: string;
  approved: boolean;
  createdAt: Date;
}

export default function CommentsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewComment, setViewComment] = useState<Comment | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  
  // Simulate fetching comments
  const { data: comments, isLoading, refetch } = useQuery<Comment[]>({
    queryKey: ["/api/admin/comments"],
  });
  
  // Approve/reject mutation
  const approvalMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: number, approved: boolean }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id, approved };
    },
    onSuccess: (data) => {
      toast({ 
        title: data.approved ? "Comment approved" : "Comment rejected",
        description: data.approved 
          ? "The comment is now visible to visitors." 
          : "The comment has been rejected."
      });
      refetch();
    },
    onError: () => {
      toast({ 
        title: "Action failed", 
        description: "There was a problem updating the comment.",
        variant: "destructive" 
      });
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (commentId: number) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return commentId;
    },
    onSuccess: () => {
      toast({ title: "Comment deleted successfully" });
      refetch();
    },
    onError: () => {
      toast({ 
        title: "Delete failed", 
        description: "There was a problem deleting the comment.",
        variant: "destructive" 
      });
    },
  });
  
  // Handle approve
  const handleApprove = (commentId: number) => {
    approvalMutation.mutate({ id: commentId, approved: true });
  };
  
  // Handle reject
  const handleReject = (commentId: number) => {
    if (confirm("Are you sure you want to reject this comment?")) {
      approvalMutation.mutate({ id: commentId, approved: false });
    }
  };
  
  // Handle delete
  const handleDelete = (commentId: number) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteMutation.mutate(commentId);
    }
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString();
  };
  
  // Truncate text
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };
  
  // Filter comments based on search query and filter
  const filteredComments = comments?.filter(comment => {
    // First filter by search query
    const matchesSearch = 
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.postTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Then filter by approval status
    if (filter === "all") return matchesSearch;
    if (filter === "pending") return matchesSearch && !comment.approved;
    if (filter === "approved") return matchesSearch && comment.approved;
    
    return matchesSearch;
  });
  
  // Get counts for filter badges
  const pendingCount = comments?.filter(c => !c.approved).length || 0;
  const approvedCount = comments?.filter(c => c.approved).length || 0;
  
  return (
    <AdminLayout title="Comments">
      <PageHeader 
        title="Comments" 
        description="Manage and moderate user comments"
      />
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative">
              <Input
                placeholder="Search comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 pl-10"
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-mutedText" />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={filter === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilter("all")}
              >
                All ({comments?.length || 0})
              </Button>
              <Button 
                variant={filter === "pending" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilter("pending")}
                className={pendingCount > 0 ? "border-amber-500 text-amber-500" : ""}
              >
                Pending ({pendingCount})
              </Button>
              <Button 
                variant={filter === "approved" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilter("approved")}
              >
                Approved ({approvedCount})
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-neonBlue" />
            </div>
          ) : !filteredComments?.length ? (
            <div className="text-center py-8 text-mutedText">
              {searchQuery 
                ? "No comments match your search query." 
                : "No comments found."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell className="font-medium">
                      <div>{comment.author}</div>
                      <div className="text-xs text-mutedText">{comment.email}</div>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => setViewComment(comment)}
                        className="text-left hover:text-neonBlue transition-colors"
                      >
                        {truncateText(comment.content, 50)}
                      </button>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={`/post/${comment.postId}`} 
                        target="_blank" 
                        className="flex items-center text-sm hover:text-neonBlue transition-colors"
                      >
                        {truncateText(comment.postTitle, 30)}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </TableCell>
                    <TableCell className="text-sm text-mutedText">
                      {formatDate(comment.createdAt)}
                    </TableCell>
                    <TableCell>
                      {comment.approved ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700">Approved</Badge>
                      ) : (
                        <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setViewComment(comment)}
                        title="View comment"
                        className="mr-1"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {!comment.approved && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleApprove(comment.id)}
                          title="Approve comment"
                          className="mr-1 text-emerald-500 hover:text-emerald-600"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleReject(comment.id)}
                        title="Reject comment"
                        className="mr-1 text-amber-500 hover:text-amber-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(comment.id)}
                        title="Delete comment"
                        className="text-dangerRed hover:text-dangerRed/80"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* View Comment Dialog */}
          <Dialog open={!!viewComment} onOpenChange={(open) => !open && setViewComment(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comment from {viewComment?.author}
                </DialogTitle>
                <DialogDescription>
                  Posted on {viewComment && formatDate(viewComment.createdAt)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 p-4 bg-darkBg rounded-md">
                <p className="whitespace-pre-wrap">{viewComment?.content}</p>
              </div>
              
              <div className="mt-4 text-sm">
                <p><strong>Email:</strong> {viewComment?.email}</p>
                <p><strong>Post:</strong> {viewComment?.postTitle}</p>
                <p><strong>Status:</strong> {viewComment?.approved ? "Approved" : "Pending"}</p>
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                {viewComment && !viewComment.approved && (
                  <Button 
                    onClick={() => {
                      handleApprove(viewComment.id);
                      setViewComment(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (viewComment) {
                      handleReject(viewComment.id);
                      setViewComment(null);
                    }
                  }}
                  className="border-amber-500 text-amber-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (viewComment) {
                      handleDelete(viewComment.id);
                      setViewComment(null);
                    }
                  }}
                  className="border-dangerRed text-dangerRed"
                >
                  <X className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 