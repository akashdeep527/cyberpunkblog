import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "../components/layout/DashboardLayout";
import PageHeader from "../components/dashboard/PageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Loader2, Plus, Pencil, Trash2, UserPlus, Search } from "lucide-react";
import { useToast } from "../hooks/use-toast";

// Define User type based on your schema
interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

export default function UsersPage() {
  const { toast } = useToast();
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form state for new/editing user
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch users
  const { data: users, isLoading, refetch } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: { username: string; password: string; isAdmin: boolean }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: Date.now(), ...userData };
    },
    onSuccess: () => {
      toast({ title: "User created successfully" });
      resetForm();
      refetch();
    },
    onError: () => {
      toast({ 
        title: "Error creating user", 
        description: "There was a problem creating the user.",
        variant: "destructive" 
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: { id: number; username: string; password?: string; isAdmin: boolean }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return userData;
    },
    onSuccess: () => {
      toast({ title: "User updated successfully" });
      resetForm();
      refetch();
    },
    onError: () => {
      toast({ 
        title: "Error updating user", 
        description: "There was a problem updating the user.",
        variant: "destructive" 
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return userId;
    },
    onSuccess: () => {
      toast({ title: "User deleted successfully" });
      refetch();
    },
    onError: () => {
      toast({ 
        title: "Error deleting user", 
        description: "There was a problem deleting the user.",
        variant: "destructive" 
      });
    },
  });

  // Reset form
  const resetForm = () => {
    setUsername("");
    setPassword("");
    setIsAdmin(false);
    setEditingUser(null);
    setNewUserOpen(false);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update existing user
      updateUserMutation.mutate({
        id: editingUser.id,
        username,
        ...(password ? { password } : {}), // Only include password if it's provided
        isAdmin,
      });
    } else {
      // Create new user
      createUserMutation.mutate({ username, password, isAdmin });
    }
  };

  // Edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUsername(user.username);
    setIsAdmin(user.isAdmin);
    setPassword(""); // Don't populate password
    setNewUserOpen(true);
  };

  // Delete user
  const handleDeleteUser = (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Filter users based on search query
  const filteredUsers = users?.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Users">
      <PageHeader 
        title="Users" 
        description="Manage your blog users"
      >
        <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setNewUserOpen(true);
            }}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Edit the user details below.' 
                  : 'Fill in the details to create a new user.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                </Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editingUser}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isAdmin"
                  checked={isAdmin}
                  onCheckedChange={(checked) => setIsAdmin(checked as boolean)}
                />
                <Label htmlFor="isAdmin">Administrator</Label>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                >
                  {(createUserMutation.isPending || updateUserMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 relative">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="h-4 w-4 absolute left-3 top-3 text-mutedText" />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-neonBlue" />
            </div>
          ) : !filteredUsers?.length ? (
            <div className="text-center py-8 text-mutedText">
              {searchQuery 
                ? "No users match your search" 
                : "No users found. Create your first user!"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <span className="text-neonPink font-semibold">Admin</span>
                      ) : (
                        <span>User</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="mr-2"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4 text-dangerRed" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
} 