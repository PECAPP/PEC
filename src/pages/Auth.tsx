import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Chrome, Shield, X, Lightbulb, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { UserRole } from '@/types';
import { getRolePermissions } from '@/features/auth/lib/rolePermissions';
import { authClient } from '@/lib/auth-client';

export default function Auth() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>('student');
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('' );
  const [signupRole, setSignupRole] = useState<UserRole>('student');
  
  // Credentials modal state
  const [showCredentialsModal, setShowCredentialsModal] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await authClient.login({ email: loginEmail, password: loginPassword });
      
      // Dispatch event to trigger re-render in useAuth
      window.dispatchEvent(new Event("auth-change"));

      toast.success(`Logged in successfully!`);
      setIsLoading(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    toast.error('Google login is temporarily disabled during migration to Postgres.');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await authClient.signup({ 
        email: signupEmail, 
        password: signupPassword,
        name: signupName,
        role: signupRole 
      });
      
      // Dispatch event to trigger re-render in useAuth
      window.dispatchEvent(new Event("auth-change"));

      toast.success('Account created successfully!');
      setIsLoading(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    toast.error('Google signup is temporarily disabled during migration to Postgres.');
  };

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'student', label: 'Student' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'college_admin', label: 'College Admin' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Test Credentials Modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-accent/10 border-b border-border px-6 py-5 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-2">
                  <Shield className="w-7 h-7 text-accent" />
                  Test Credentials
                </h2>
                <p className="text-sm text-muted-foreground">
                  Click any role below to auto-fill login credentials
                </p>
              </div>
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-accent/10"
                aria-label="Close credentials modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-3">
                {/* Student Credentials - Arjun Patel */}
                <button
                  onClick={() => {
                    setLoginEmail('arjun.patel@pec.edu');
                    setLoginPassword('Student@123');
                    setLoginRole('student');
                    setShowCredentialsModal(false);
                  }}
                  className="w-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-all cursor-pointer text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">Student - Arjun Patel</h3>
                      <p className="text-xs text-muted-foreground mb-2">CSE, Semester 6</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-16">Email:</span>
                          <code className="text-xs font-mono bg-card px-2 py-0.5 rounded border border-border">arjun.patel@pec.edu</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-16">Password:</span>
                          <code className="text-xs font-mono bg-card px-2 py-0.5 rounded border border-border">Student@123</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Faculty Credentials - Dr. Priya Sharma */}
                <button
                  onClick={() => {
                    setLoginEmail('priya.cse@pec.edu');
                    setLoginPassword('Faculty@123');
                    setLoginRole('faculty');
                    setShowCredentialsModal(false);
                  }}
                  className="w-full bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-all cursor-pointer text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">Faculty - Dr. Priya Sharma</h3>
                      <p className="text-xs text-muted-foreground mb-2">CSE Department, AI & ML Specialist</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-16">Email:</span>
                          <code className="text-xs font-mono bg-card px-2 py-0.5 rounded border border-border">priya.cse@pec.edu</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-16">Password:</span>
                          <code className="text-xs font-mono bg-card px-2 py-0.5 rounded border border-border">Faculty@123</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

              </div>

              {/* Info Banner */}
              <div className="mt-4 bg-accent/10 border border-accent/30 rounded-xl p-3 flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-foreground/90 font-medium mb-1">
                    Demo Environment
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click any role card above to automatically fill in the login form with test credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-accent/5 border-t border-border px-6 py-3 flex items-center justify-end">
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                I'll enter my own credentials
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <GraduationCap className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold">PEC</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Welcome to the Future of Education Management
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Streamline your academic journey with our comprehensive ERP solution. 
              From attendance to placements, we've got you covered.
            </p>
          </motion.div>
          
          {/* Decorative elements */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -mr-32 -mb-32" />
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-primary-foreground/5 rounded-full" />
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">PEC</span>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Get Started</CardTitle>
              <CardDescription>Sign in to your account or create a new one</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-role">Login As</Label>
                      <Select
                        value={loginRole}
                        onValueChange={(v) => setLoginRole(v as UserRole)}
                      >
                        <SelectTrigger id="login-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@university.edu"
                          className="pl-10"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-border" />
                        <span className="text-muted-foreground">Remember me</span>
                      </label>
                      <a href="#" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      <Chrome className="w-4 h-4 mr-2" />
                      Sign in with Google
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@university.edu"
                          className="pl-10"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-role">I am a</Label>
                      <Select value={signupRole} onValueChange={(v) => setSignupRole(v as UserRole)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Create Account'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignup}
                      disabled={isLoading}
                    >
                      <Chrome className="w-4 h-4 mr-2" />
                      Sign up with Google
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
