import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Key, LogIn, UserPlus } from "lucide-react";

// Extended schema with validation
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = insertUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      isAdmin: false,
    },
  });
  
  // Handle login submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };
  
  // Handle register submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    // Remove confirmPassword as it's not part of the API schema
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/admin");
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen bg-darkBg text-cyberText">
      <div className="relative py-8 md:py-0">
        <div className="absolute inset-0 bg-[radial-gradient(#05d9e833_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row h-full md:h-screen">
            {/* Auth Forms Column */}
            <div className="md:w-1/2 flex flex-col justify-center">
              <div className="max-w-md mx-auto mb-8 md:mb-0">
                <Link href="/">
                  <a className="font-orbitron font-bold text-2xl text-neonPink flex items-center mb-8">
                    <div className="w-8 h-8 mr-2 flex items-center justify-center">
                      <div className="w-6 h-6 bg-neonPink rotate-45"></div>
                    </div>
                    <span className="glitch-hover">NeonPulse</span>
                  </a>
                </Link>
                
                <CyberBorder className="rounded-lg bg-darkerBg p-6">
                  <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 mb-6">
                      <TabsTrigger value="login" className="font-orbitron">Log In</TabsTrigger>
                      <TabsTrigger value="register" className="font-orbitron">Register</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="login">
                      <div className="mb-4">
                        <h2 className="font-orbitron text-2xl font-bold text-neonPink mb-2">Welcome Back</h2>
                        <p className="text-cyberText/80">Enter your credentials to access your account</p>
                      </div>
                      
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-cyberText">Username</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      placeholder="Enter your username" 
                                      className="bg-darkBg border border-neonBlue/30 rounded pl-10"
                                      {...field} 
                                    />
                                    <User className="h-4 w-4 text-mutedText absolute left-3 top-3" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-cyberText">Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      type="password" 
                                      placeholder="Enter your password" 
                                      className="bg-darkBg border border-neonBlue/30 rounded pl-10"
                                      {...field} 
                                    />
                                    <Key className="h-4 w-4 text-mutedText absolute left-3 top-3" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-neonPink text-white hover:bg-neonPink/80"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging in...
                              </>
                            ) : (
                              <>
                                <LogIn className="mr-2 h-4 w-4" />
                                Log In
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                      
                      <div className="mt-4 text-center">
                        <p className="text-sm text-mutedText">
                          Don't have an account?{" "}
                          <button 
                            onClick={() => setActiveTab("register")} 
                            className="text-neonBlue hover:text-neonBlue/80 transition-colors"
                          >
                            Register
                          </button>
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="register">
                      <div className="mb-4">
                        <h2 className="font-orbitron text-2xl font-bold text-neonPink mb-2">Join NeonPulse</h2>
                        <p className="text-cyberText/80">Create your account to get started</p>
                      </div>
                      
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-cyberText">Username</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      placeholder="Choose a username" 
                                      className="bg-darkBg border border-neonBlue/30 rounded pl-10"
                                      {...field} 
                                    />
                                    <User className="h-4 w-4 text-mutedText absolute left-3 top-3" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-cyberText">Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      type="password" 
                                      placeholder="Create a password" 
                                      className="bg-darkBg border border-neonBlue/30 rounded pl-10"
                                      {...field} 
                                    />
                                    <Key className="h-4 w-4 text-mutedText absolute left-3 top-3" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-cyberText">Confirm Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      type="password" 
                                      placeholder="Confirm your password" 
                                      className="bg-darkBg border border-neonBlue/30 rounded pl-10"
                                      {...field} 
                                    />
                                    <Key className="h-4 w-4 text-mutedText absolute left-3 top-3" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-neonPink text-white hover:bg-neonPink/80"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registering...
                              </>
                            ) : (
                              <>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Register
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                      
                      <div className="mt-4 text-center">
                        <p className="text-sm text-mutedText">
                          Already have an account?{" "}
                          <button 
                            onClick={() => setActiveTab("login")} 
                            className="text-neonBlue hover:text-neonBlue/80 transition-colors"
                          >
                            Log In
                          </button>
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CyberBorder>
                
                <div className="mt-6 text-center">
                  <Link href="/">
                    <a className="text-mutedText hover:text-neonBlue transition-colors text-sm">
                      ← Back to Blog
                    </a>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Hero Column */}
            <div className="md:w-1/2 bg-darkerBg hidden md:flex items-center justify-center p-8">
              <div className="max-w-lg">
                <h1 className="font-orbitron text-4xl font-bold text-neonPink mb-4 glitch-hover">
                  Enter the Cyberpunk Universe
                </h1>
                <p className="text-cyberText/80 mb-6 text-lg">
                  Join NeonPulse to explore the digital frontier. Share your thoughts, publish articles, and connect with fellow cyberpunk enthusiasts in a neon-drenched community.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="rounded-full bg-neonPink/10 p-1 mr-2">
                      <div className="rounded-full bg-neonPink w-2 h-2"></div>
                    </div>
                    <span className="text-cyberText">Create and publish cyberpunk-themed content</span>
                  </li>
                  <li className="flex items-center">
                    <div className="rounded-full bg-neonPink/10 p-1 mr-2">
                      <div className="rounded-full bg-neonPink w-2 h-2"></div>
                    </div>
                    <span className="text-cyberText">Access your personalized dashboard</span>
                  </li>
                  <li className="flex items-center">
                    <div className="rounded-full bg-neonPink/10 p-1 mr-2">
                      <div className="rounded-full bg-neonPink w-2 h-2"></div>
                    </div>
                    <span className="text-cyberText">Monitor traffic and engagement analytics</span>
                  </li>
                  <li className="flex items-center">
                    <div className="rounded-full bg-neonPink/10 p-1 mr-2">
                      <div className="rounded-full bg-neonPink w-2 h-2"></div>
                    </div>
                    <span className="text-cyberText">Customize themes and appearance</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cyber Border Component
function CyberBorder({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`cyber-border ${className || ""}`}>
      <style jsx>{`
        .cyber-border {
          position: relative;
          border: 1px solid transparent;
          background-clip: padding-box;
        }
        
        .cyber-border::after {
          content: '';
          position: absolute;
          top: -2px; right: -2px; bottom: -2px; left: -2px;
          background: linear-gradient(45deg, #ff2a6d, #05d9e8, #9d4edd);
          z-index: -1;
          border-radius: inherit;
        }
      `}</style>
      {children}
    </div>
  );
}
