'use client';
import { Button, Input, Tabs, TabsContent, TabsList, TabsTrigger } from "@pec/ui";


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/hooks/useAuth';

import { 
 Mail, Lock, Eye, EyeOff, Loader, 
 AlertCircle, CheckCircle, X, 
 GraduationCap, Users, Building2, Shield,
 ChevronRight, LogIn, UserPlus
} from 'lucide-react';

type UserRole = 'student' | 'faculty' | 'college_admin';

interface AuthClientProps {
 _initialSessionStatus?: boolean;
}

export default function AuthClient({ _initialSessionStatus = false }: AuthClientProps) {
 const router = useRouter();
 const { user, isAuthenticated, loading: authLoading, login } = useAuth();
 const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
 const [showPassword, setShowPassword] = useState(false);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');

 const [formData, setFormData] = useState({
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  role: 'student' as UserRole,
  agreeToTerms: false,
 });

 const [forgotEmail, setForgotEmail] = useState('');
 const [showCredentialsModal, setShowCredentialsModal] = useState(true);

 const fillCredentials = (email: string, password: string) => {
  setFormData(prev => ({ ...prev, email, password }));
  setShowCredentialsModal(false);
  setActiveTab('signin');
 };

 useEffect(() => {
  if (!authLoading && isAuthenticated && user) {
   let redirectPath = '/dashboard';
   if (!user?.role) {
    redirectPath = '/role-selection';
   } else if (!user?.profileComplete) {
    redirectPath = '/onboarding';
   } else if (user.role === 'student') {
    redirectPath = '/dashboard';
   } else if (user.role === 'faculty') {
    redirectPath = '/dashboard';
   } else if (user.role === 'college_admin') {
    redirectPath = '/dashboard';
   }
   router.replace(redirectPath as any);
  }
 }, [authLoading, isAuthenticated, user, router]);

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value, type, checked } = e.target;
  setFormData(prev => ({
   ...prev,
   [name]: type === 'checkbox' ? checked : value,
  }));
 };

  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const { login2FA } = useAuth() as { login2FA: (userId: string, code: string) => Promise<void> };

  const handleSignIn = async (e: React.FormEvent) => {
   e.preventDefault();
   setError('');
   setSuccess('');

   if (requires2FA) {
     if (!totpCode || totpCode.length !== 6) {
       setError('Please enter a valid 6-digit code');
       return;
     }
     try {
       setLoading(true);
       await login2FA(userId, totpCode);
       setSuccess('Authenticating...');
     } catch (err: unknown) {
       setError((err as Error).message || 'Invalid 2FA code');
     } finally {
       setLoading(false);
     }
     return;
   }

   const email = formData.email.trim();
   const password = formData.password;

   if (!email) {
     setError('Email is required');
     return;
   }
   if (!/^\S+@\S+\.\S+$/.test(email)) {
     setError('Please enter a valid email');
     return;
   }
   if (!password) {
     setError('Password is required');
     return;
   }
   if (password.length < 8) {
     setError('Password must be at least 8 characters');
     return;
   }

   try {
     setLoading(true);
     const res = await login(email, password);
     if (res?.requires2FA) {
       setRequires2FA(true);
       setUserId(res.userId);
       setSuccess('Please enter your 2FA code');
     } else {
       setSuccess('Signing in...');
     }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to sign in');
    } finally {
     setLoading(false);
   }
  };

 const handleForgotPassword = (e: React.FormEvent) => {
  e.preventDefault();
  setError('Forgot password is not yet implemented on the backend.');
 };

 if (authLoading) {
  return (
   <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-700">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col items-center space-y-8"
    >
      {/* LOGO AREA */}
      <div className="relative group">
       <div className="flex items-baseline">
        <span className="text-6xl md:text-8xl font-bold tracking-tight text-accent leading-none">P</span>
        <div className="relative">
         {/* THE ACCENT */}
         <span className="text-6xl md:text-8xl font-bold tracking-tight text-accent leading-none">E</span>
        </div>
        <span className="text-6xl md:text-8xl font-bold tracking-tight text-accent leading-none">C</span>
       </div>
      </div>
     
     <div className="space-y-2 text-center">
      <p className="text-sm font-medium  text-accent/80">
       EXPLORE. INNOVATE. EXCEL.
      </p>
      <p className="text-xs font-medium  text-accent/40 italic">
       Punjab Engineering College
      </p>
     </div>
    </motion.div>

    {/* INDEFINITE ACCENT LOADER */}
    <div className="flex gap-1.5">
     {[0, 1, 2].map((i) => (
       <motion.div
        key={i}
        animate={{ 
         opacity: [0.2, 1, 0.2],
         scale: [1, 1.2, 1] 
        }}
        transition={{ 
         repeat: Infinity, 
         duration: 1, 
         delay: i * 0.2 
        }}
        className="w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_rgba(255,255,0,0.5)]"
       />
     ))}
    </div>
   </div>
  );
 }

   return (
   <div className="min-h-screen w-full flex bg-background text-foreground">
    
    {/* LEFT SIDE: IMAGE (Hidden on mobile) */}
    <div className="hidden lg:flex flex-col flex-1 relative bg-muted items-center justify-center overflow-hidden">
      <motion.img 
       initial={{ scale: 1 }}
       animate={{ scale: 1.05 }}
       transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
       src="/login.webp" 
       className="absolute inset-0 w-full h-full object-cover opacity-90" 
       alt="PEC Academic Block" 
      />
      {/* Dark overlay just enough to make text readable, no complex gradients */}
      <div className="absolute inset-0 bg-black/60" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 p-12 text-center flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg p-2 overflow-hidden mb-6">
         <img src="/logo.png" alt="PEC Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-white drop-shadow-xl mb-4">
          Punjab Engineering College
        </h1>
        <p className="text-lg text-white/80 font-medium max-w-md leading-relaxed drop-shadow-md">
          Official gateway for academics, attendance, and institutional services.
        </p>
      </motion.div>
    </div>

    {/* RIGHT SIDE: CLEAN SOLID FORM */}
    <div className="w-full lg:w-[500px] flex items-center justify-center p-8 bg-card shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.1)] z-10 relative">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-sm"
      >
        {/* Mobile Logo */}
        <div className="flex lg:hidden items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-white rounded-xl shadow-sm p-1.5 border border-border">
            <img src="/logo.png" alt="PEC Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-widest uppercase">PEC</h2>
            <p className="text-[10px] text-muted-foreground uppercase">Chandigarh</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            {activeTab === 'signin' ? 'Welcome back' : activeTab === 'signup' ? 'Request Access' : 'Account Recovery'}
          </h2>
          <p className="text-muted-foreground text-sm">
            Authenticate via the central university network.
          </p>
        </div>

        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-8 p-3 border flex gap-3 text-xs font-semibold items-center rounded-lg ${
              error ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-success/10 border-success/20 text-success'
            }`}
          >
            {error ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{error || success}</span>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted p-1 h-12 rounded-lg">
            <TabsTrigger value="signin" className="rounded-md text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-semibold uppercase text-[10px] tracking-widest transition-all gap-1.5 flex items-center justify-center"><LogIn className="w-3.5 h-3.5" />Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-md text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-semibold uppercase text-[10px] tracking-widest transition-all gap-1.5 flex items-center justify-center"><UserPlus className="w-3.5 h-3.5" />Register</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-6 mt-0">
            <form onSubmit={handleSignIn} className="space-y-4">
              {requires2FA ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">2FA Verification Code</label>
                  <div className="relative group">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                    <Input
                      name="totpCode"
                      type="text"
                      placeholder="123456"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      className="pl-10 h-12 w-full rounded-lg border-border bg-background focus:ring-2 focus:ring-primary/20 transition-all font-mono tracking-[0.5em] text-center text-lg"
                      maxLength={6}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Institutional Email</label>
                    <div className="relative group">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                      <Input
                        name="email"
                        type="email"
                        placeholder="arjun@pec.edu"
                        value={formData.email}
                        onChange={handleInputChange}
                        autoComplete="username"
                        className="pl-10 h-12 w-full rounded-lg border-border bg-background hover:bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground">Password</label>
                      <button type="button" onClick={() => setActiveTab('forgot')} className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors">Forgot password?</button>
                    </div>
                    <div className="relative group">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        autoComplete="current-password"
                        className="pl-10 pr-10 h-12 w-full rounded-lg border-border bg-background hover:bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-bold hover:brightness-110 transition-all shadow-sm">
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : requires2FA ? 'Verify Code' : 'Sign In'}
                </Button>
              </div>
            </form>

            {/* Seamless Test Accounts Trigger */}
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => setShowCredentialsModal(true)}
                className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-muted/50 px-4 py-2 rounded-full border border-border"
              >
                <Shield className="w-3.5 h-3.5" />
                Quick Access Demo
              </button>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="mt-0">
            <div className="bg-muted border border-border/50 p-8 text-center space-y-6 rounded-xl">
              <div className="w-16 h-16 bg-white flex items-center justify-center mx-auto rounded-xl border border-border/50 p-2 shadow-sm">
                <img src="/logo.png" alt="PEC Logo" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">Institutional Access</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Accounts are provisioned exclusively by the Office of Academic Affairs.</p>
              </div>
              <Button onClick={() => router.push('/apply-institution' as any)} variant="outline" className="w-full h-11 rounded-lg font-bold text-xs bg-background">
                Open Registration Portal
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="forgot" className="mt-0">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Institutional Email</label>
                <Input type="email" placeholder="arjun@pec.edu" className="h-12 rounded-lg border-border bg-background focus:ring-2 focus:ring-primary/20 font-medium" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-bold shadow-sm hover:brightness-110 mt-2">
                Send Reset Link
              </Button>
              <Button variant="ghost" onClick={() => setActiveTab('signin')} className="w-full h-10 text-xs font-semibold text-muted-foreground hover:text-foreground">
                Return to Sign In
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>

   {/* IDENTITY MODAL */}
   {showCredentialsModal && (
   <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
     <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-card border border-border rounded-xl shadow-2xl max-w-xl w-full overflow-hidden"
     >
      <div className="p-6 relative border-b border-border flex items-start justify-between">
       <div>
         <h2 className="text-xl font-bold">Test Accounts</h2>
         <p className="text-sm text-muted-foreground mt-1">Select a test account to auto-fill sign-in credentials</p>
       </div>
       <button 
        onClick={() => setShowCredentialsModal(false)}
        className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-all text-muted-foreground hover:text-foreground"
       >
        <X className="w-4 h-4" />
       </button>
      </div>

      <div className="p-6 grid gap-3 bg-muted/30">
       {[
        { r: 'student', e: 'student@pec.edu', p: 'password123', i: GraduationCap, t: 'TEST STUDENT' },
        { r: 'faculty', e: 'faculty@pec.edu', p: 'password123', i: Users, t: 'TEST FACULTY' },
        { r: 'college_admin', e: 'admin@pec.edu', p: 'password123', i: Building2, t: 'Admin' }
       ].map((role) => (
        <button
         key={role.r}
         onClick={() => fillCredentials(role.e, role.p)}
         className="flex items-center gap-4 p-4 border border-border bg-card hover:bg-muted hover:border-border/80 transition-all group rounded-xl text-left shadow-sm hover:shadow"
        >
         <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
          <role.i className="w-5 h-5" />
         </div>
         <div className="flex-1">
          <h4 className="font-bold text-sm text-foreground">{role.t}</h4>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">{role.e}</p>
         </div>
         <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold border border-border text-muted-foreground bg-muted px-2 py-0.5 rounded-md capitalize">
           {role.r.replace('_', ' ')}
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
         </div>
        </button>
       ))}
      </div>
     </motion.div>
    </div>
   )}
  </div>
 );
}

