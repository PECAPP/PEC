import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, User, Eye, EyeOff, Loader, AlertCircle, CheckCircle, Shield, X, Lightbulb, GraduationCap, Users, Building2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

type UserRole = 'student' | 'faculty' | 'college_admin';

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
  role: UserRole;
  agreeToTerms: boolean;
}

export default function AuthEnhanced() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userAuthenticated, setUserAuthenticated] = useState(false);

  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'student',
    agreeToTerms: false,
  });

  const [forgotEmail, setForgotEmail] = useState('');
  
  // Credentials modal state
  const [showCredentialsModal, setShowCredentialsModal] = useState(true);
  
  // Helper function to fill credentials
  const fillCredentials = (email: string, password: string) => {
    setFormData(prev => ({ ...prev, email, password }));
    setShowCredentialsModal(false);
    setActiveTab('signin');
  };

  // Check if user is already authenticated
  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        await authClient.refreshAccessToken();
        if (active) {
          setUserAuthenticated(true);
          setTimeout(() => navigate('/dashboard'), 500);
        }
      } catch {
        if (active) {
          setUserAuthenticated(false);
        }
      }
    };

    void restoreSession();

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkboxElement = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkboxElement.checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.fullName?.trim()) {
      setError('Full name is required');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.agreeToTerms) {
      setError('You must agree to terms and conditions');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: "student", // defaulting to student until role selection logic is built or handled
      };

      await authClient.signup(payload);
      window.dispatchEvent(new Event("auth-change"));

      setSuccess(`Account created successfully!`);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }

    try {
      setLoading(true);
      await authClient.login({ email: formData.email, password: formData.password });
      window.dispatchEvent(new Event("auth-change"));

      setSuccess('Signing in...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (isSignUp: boolean) => {
    setError('Google authentication is not yet implemented on the backend.');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('Forgot password is not yet implemented on the backend.');
  };

  if (userAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Already Authenticated</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>You're already signed in. Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
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
                  onClick={() => fillCredentials('arjun.patel@pec.edu', 'Student@123')}
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
                  onClick={() => fillCredentials('priya.cse@pec.edu', 'Faculty@123')}
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

                {/* College Admin Credentials */}
                <button
                  onClick={() => fillCredentials('registrar@pec.edu', 'Admin@123')}
                  className="w-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-4 hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-all cursor-pointer text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">College Admin</h3>
                      <p className="text-xs text-muted-foreground mb-2">Registrar Office</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-16">Email:</span>
                          <code className="text-xs font-mono bg-card px-2 py-0.5 rounded border border-border">registrar@pec.edu</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-16">Password:</span>
                          <code className="text-xs font-mono bg-card px-2 py-0.5 rounded border border-border">Admin@123</code>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to PEC</CardTitle>
            <CardDescription>Manage your educational institution</CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-2 text-sm text-red-600"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex gap-2 text-sm text-green-600"
              >
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </motion.div>
            )}

            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="forgot">Forgot Pass</TabsTrigger>
              </TabsList>

              {/* SIGN IN TAB */}
              <TabsContent value="signin" className="space-y-4 mt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <div className="relative mt-1">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative mt-1">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div
                    className="text-sm text-primary cursor-pointer hover:underline"
                    onClick={() => setActiveTab('forgot')}
                  >
                    Forgot password?
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Sign In'}
                  </Button>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleGoogleAuth(false)}
                  className="w-full"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>
              </TabsContent>

              {/* SIGN UP TAB - Redirects to Institution Application */}
              <TabsContent value="signup" className="space-y-4 mt-4">
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Looking to Join?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Individual user accounts are created by your institution's admin.
                    </p>
                  </div>

                  <div className="bg-secondary/30 border border-border rounded-lg p-4 space-y-3">
                    <p className="text-sm text-foreground font-medium">
                      Are you an educational institution?
                    </p>
                    <Button
                      type="button"
                      onClick={() => navigate('/apply-institution')}
                      className="w-full"
                    >
                      Apply as Institution
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Already have an account?{' '}
                      <span
                        className="text-primary cursor-pointer hover:underline"
                        onClick={() => setActiveTab('signin')}
                      >
                        Sign in here
                      </span>
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* FORGOT PASSWORD TAB */}
              <TabsContent value="forgot" className="space-y-4 mt-4">
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter your email and we'll send you a link to reset your password.
                  </p>

                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <div className="relative mt-1">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        disabled={loading}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('signin')}
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
