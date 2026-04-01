'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
 Mail, Lock, Eye, EyeOff, Loader, 
 AlertCircle, CheckCircle, X, 
 GraduationCap, Users, Building2, Shield,
 ChevronRight, Globe
} from 'lucide-react';

type UserRole = 'student' | 'faculty' | 'college_admin';

interface AuthClientProps {
 initialSessionStatus?: boolean;
}

export default function AuthClient({ initialSessionStatus = false }: AuthClientProps) {
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
   const redirectPath = 
    !user?.role ? '/role-selection'
    : !user?.profileComplete ? '/onboarding'
    : '/dashboard';
   
   router.replace(redirectPath);
  }
 }, [authLoading, isAuthenticated, user, router]);

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value, type, checked } = e.target;
  setFormData(prev => ({
   ...prev,
   [name]: type === 'checkbox' ? checked : value,
  }));
 };

 const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setSuccess('');

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
    await login(email, password);
    setSuccess('Signing in...');
  } catch (err: any) {
    setError(err.message || 'Failed to sign in');
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
       <span className="text-8xl md:text-[10rem] font-bold tracking-tight text-accent leading-none">P</span>
       <div className="relative">
        {/* THE RED SLASH ACCENT */}
        <motion.div 
         initial={{ width: 0 }}
         animate={{ width: '100%' }}
         transition={{ delay: 0.5, duration: 0.5 }}
         className="absolute -top-4 left-0 h-4 md:h-6 bg-[#FF0000] skew-x-[20deg] z-10 shadow-[0_0_20px_rgba(255,0,0,0.6)]" 
        />
        <span className="text-8xl md:text-[10rem] font-bold tracking-tight text-accent leading-none">E</span>
       </div>
       <span className="text-8xl md:text-[10rem] font-bold tracking-tight text-accent leading-none">C</span>
      </div>
      <div className="absolute -bottom-4 left-0 w-full h-1 bg-accent/20 overflow-hidden">
        <motion.div 
         animate={{ x: ['-100%', '100%'] }}
         transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
         className="w-1/2 h-full bg-accent"
        />
      </div>
     </div>
     
     <div className="space-y-2 text-center">
      <p className="text-[11px] font-black uppercase tracking-[0.6em] text-accent/80">
       EXPLORE. INNOVATE. EXCEL.
      </p>
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent/40 italic">
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
  <div className="h-screen flex flex-col md:flex-row bg-background overflow-hidden relative font-sans">
   {/* LEFT SIDE: BRANDING & IMAGE (SWISS - CLEANER & BILINGUAL) */}
   <div className="hidden md:flex md:w-6/12 bg-black relative flex-col justify-center p-12 lg:p-16 text-white group overflow-hidden border-r border-white/5">
    <div className="relative z-20 space-y-10 max-w-[560px]">
     {/* HEADER LOGO + BILINGUAL TITLE */}
     <div className="flex items-start gap-4 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-4">
      <div className="w-12 h-12 bg-accent flex items-center justify-center shadow-[4px_4px_0px_white] rounded-sm">
       <Building2 className="w-6 h-6 text-black" />
      </div>
      <div className="space-y-0.5">
        <h2 className="text-base lg:text-lg font-bold text-white uppercase tracking-tight leading-none">
        Punjab Engineering College 
       </h2>
       <p className="text-[11px] font-medium text-white/60">
        पंजाब इंजीनियरिंग कॉलेज | <span className="font-bold text-accent">Chandigarh</span>
       </p>
      </div>
     </div>

     <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="pt-4 bg-black/45 backdrop-blur-sm border border-white/10 rounded-xl p-5 max-w-[520px]"
     >
      <h1 className="text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight uppercase text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.55)]">
       Student <span className="text-accent">Portal</span>
      </h1>
      <p className="text-base lg:text-lg text-white/90 font-medium max-w-md mt-4 leading-snug tracking-tight">
       Official access portal for academics, attendance, and institutional services.
      </p>
     </motion.div>

     {/* FACES / SOCIAL PROOF */}
     <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="flex items-center gap-6 pt-5 border-t border-white/10 w-fit bg-black/35 backdrop-blur-sm rounded-lg px-4 pb-3"
     >
       <div className="flex -space-x-3">
        {[1,2,3,4].map(i => (
         <div key={i} className="w-9 h-9 border-2 border-black bg-muted flex items-center justify-center overflow-hidden rounded-sm">
          <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover grayscale brightness-110" />
         </div>
        ))}
        <div className="w-9 h-9 border-2 border-black bg-white flex items-center justify-center text-[10px] font-bold text-black rounded-sm">12K+</div>
       </div>
       <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Authorized Users</p>
     </motion.div>
    </div>

    {/* BRUTALIST IMAGE OVERLAY */}
    <div className="absolute inset-0 z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-1000">
      <img 
       src="/login.webp" 
       className="w-full h-full object-cover group-hover:scale-105 transition-transform ease-out sepia-[0.15] contrast-[1.05]" 
       style={{ transitionDuration: '7s' }}
       alt="PEC Academic Block" 
      />
    </div>
    <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/88 via-black/55 to-black/35" />
    
    <div className="absolute bottom-10 left-12 lg:left-16 z-20 flex items-center gap-4">
     <Globe className="w-4 h-4 text-white opacity-20" />
     <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.25em]">
      PEC.EDU • CHANDIGARH • 160012
     </p>
    </div>
   </div>

   {/* RIGHT SIDE: AUTH FORMS (CLEANER SWISS GRID) */}
   <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-background relative overflow-hidden">
    <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

    <motion.div
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     className="w-full max-w-[460px] z-10 bg-card/85 backdrop-blur-md border border-border/70 rounded-xl p-6 lg:p-7 shadow-[0_18px_60px_rgba(0,0,0,0.35)]"
    >
     <div className="mb-8 text-center md:text-left">
      <h2 className="text-4xl font-bold tracking-tight uppercase text-foreground leading-none mb-6">
       {activeTab === 'signin' ? 'Sign In' : activeTab === 'signup' ? 'Request Access' : 'Recovery'}
      </h2>
      <div className="h-1.5 w-16 bg-primary mb-8" />
      <p className="text-foreground/85 font-medium text-base leading-relaxed tracking-tight">
       Authenticate via the central university gateway.
      </p>
     </div>

     {(error || success) && (
      <motion.div
       initial={{ opacity: 0, scale: 0.98 }}
       animate={{ opacity: 1, scale: 1 }}
       className={`mb-10 p-4 border-2 flex gap-4 text-xs font-bold uppercase tracking-[0.1em] items-center rounded-sm ${
        error ? 'bg-destructive/5 border-destructive text-destructive' : 'bg-success/5 border-success text-success'
       }`}
      >
       {error ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
       <span>{error || success}</span>
      </motion.div>
     )}

     <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full space-y-10">
      <TabsList className="grid w-full grid-cols-2 bg-muted/90 p-1 h-12 rounded-md border border-border">
       <TabsTrigger value="signin" className="rounded-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase text-[11px] tracking-widest transition-all">Sign In</TabsTrigger>
       <TabsTrigger value="signup" className="rounded-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase text-[11px] tracking-widest transition-all">Register</TabsTrigger>
      </TabsList>

       <TabsContent value="signin" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
       <form onSubmit={handleSignIn} className="space-y-6">
        <div className="space-y-3">
         <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">Email Access</label>
         <div className="relative group">
          <Mail className="w-4 h-4 absolute left-4 top-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
          <Input
           name="email"
           type="email"
           placeholder="arjun@pec.edu"
           value={formData.email}
           onChange={handleInputChange}
          className="pl-12 h-12 rounded-md border border-border/80 bg-background/90 focus:border-primary font-semibold text-sm transition-all"
          />
         </div>
        </div>

        <div className="space-y-3">
         <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">Password</label>
          <button type="button" onClick={() => setActiveTab('forgot')} className="text-[11px] font-semibold text-primary hover:underline transition-colors">Forgot password?</button>
         </div>
         <div className="relative group">
          <Lock className="w-4 h-4 absolute left-4 top-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
          <Input
           name="password"
           type={showPassword ? 'text' : 'password'}
           placeholder="••••••••"
           value={formData.password}
           onChange={handleInputChange}
          className="pl-12 pr-12 h-12 rounded-md border border-border/80 bg-background/90 focus:border-primary font-semibold text-sm transition-all"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-muted-foreground hover:text-foreground">
           {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
         </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full h-12 rounded-md bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[11px] shadow-lg hover:brightness-110 active:scale-[0.98] transition-all">
         {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Sign In'}
        </Button>
       </form>

        <div className="relative pt-2">
        <div className="absolute inset-0 flex items-center px-4"><span className="w-full border-t border-border"></span></div>
        <div className="relative flex justify-center"><span className="bg-background px-4 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground opacity-50">Authorized Access</span></div>
       </div>

       <Button 
        variant="outline" 
        onClick={() => setShowCredentialsModal(true)}
        className="w-full h-11 rounded-md border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-[10px] font-bold uppercase tracking-widest transition-all gap-3"
       >
        <Shield className="w-4 h-4 text-primary" />
        Use Test Accounts
       </Button>
      </TabsContent>

      <TabsContent value="signup" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
       <div className="bg-muted/80 border border-border p-8 text-center space-y-6 rounded-md shadow-inner">
         <div className="w-14 h-14 bg-primary flex items-center justify-center mx-auto rounded-sm"><Building2 className="w-7 h-7 text-primary-foreground" /></div>
         <div className="space-y-2">
          <h3 className="text-xl font-bold uppercase tracking-tight">Institutional Registration</h3>
          <p className="text-[11px] text-muted-foreground font-semibold tracking-tight uppercase">Accounts are provisioned by the Office of Academic Affairs.</p>
         </div>
         <Button onClick={() => router.push('/apply-institution')} className="w-full h-11 rounded-sm uppercase font-bold tracking-widest text-[10px] bg-primary">Open Registration Portal</Button>
       </div>
      </TabsContent>

      <TabsContent value="forgot" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <form onSubmit={handleForgotPassword} className="space-y-8">
        <div className="space-y-2">
         <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">Institutional Email</label>
         <Input type="email" placeholder="ARJUN@PEC.EDU" className="h-12 rounded-sm border border-border font-medium" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
        </div>
        <Button type="submit" className="w-full h-11 rounded-sm bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[11px]">Send Reset Link</Button>
        <Button variant="ghost" onClick={() => setActiveTab('signin')} className="w-full h-10 text-[10px] font-bold uppercase tracking-widest text-primary">Return to Login</Button>
        </form>
      </TabsContent>
     </Tabs>
    </motion.div>
   </div>

   {/* IDENTITY MODAL */}
   {showCredentialsModal && (
   <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-500">
     <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-card border border-primary/40 rounded-xl shadow-[0_30px_80px_rgba(0,0,0,0.55)] max-w-2xl w-full overflow-hidden"
     >
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-8 py-8 relative border-b border-black/10">
       <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-primary-foreground/70">Secure Access</p>
       <h2 className="text-3xl font-bold uppercase tracking-tight mt-2">Test Accounts</h2>
       <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary-foreground/75 mt-3">Select a test account to auto-fill sign-in credentials</p>
       <button 
        onClick={() => setShowCredentialsModal(false)}
        className="absolute top-6 right-6 p-2 rounded-md hover:bg-white/10 transition-all text-white/60 hover:text-white"
       >
        <X className="w-5 h-5" />
       </button>
      </div>

      <div className="px-6 py-6 border-b border-border/60 bg-card">
       <p className="text-xs text-muted-foreground font-semibold">
        Choose an account below to populate email and password.
       </p>
      </div>

      <div className="p-6 grid gap-3 bg-gradient-to-b from-background to-background/80">
       {[
        { r: 'student', e: 'arjun@pec.edu', p: 'password123', i: GraduationCap, t: 'ARJUN SHARMA' },
        { r: 'faculty', e: 'faculty@pec.edu', p: 'password123', i: Users, t: 'DR. PRIYA RAO' },
        { r: 'college_admin', e: 'admin@pec.edu', p: 'password123', i: Building2, t: 'SYSTEM REGISTRAR' }
       ].map((role) => (
        <button
         key={role.r}
         onClick={() => fillCredentials(role.e, role.p)}
         className="flex items-center gap-4 p-4 border border-border/80 bg-background hover:bg-muted/50 hover:border-primary/40 transition-all group rounded-lg text-left"
        >
         <div className="w-12 h-12 bg-primary/90 text-primary-foreground flex items-center justify-center group-hover:scale-105 transition-transform rounded-md shadow-md">
          <role.i className="w-5 h-5" />
         </div>
         <div className="flex-1 text-left">
          <h4 className="font-bold text-sm uppercase text-foreground group-hover:text-primary transition-colors">{role.t}</h4>
          <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-70 font-bold mt-0.5">{role.e}</p>
         </div>
         <div className="flex items-center gap-3">
          <span className="text-[9px] uppercase tracking-wider font-bold border border-primary/30 text-primary bg-primary/5 px-2 py-1 rounded-md">
           {role.r.replace('_', ' ')}
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
         </div>
        </button>
       ))}
      </div>

      <div className="bg-muted/40 px-6 py-4 border-t border-border flex items-center justify-between gap-3">
       <p className="text-[9px] text-muted-foreground uppercase tracking-[0.24em] font-bold opacity-65">For Demonstration in Sandbox Environment</p>
       <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowCredentialsModal(false)}
        className="text-[10px] uppercase tracking-wider font-bold"
       >
        Continue Manually
       </Button>
      </div>
     </motion.div>
    </div>
   )}
  </div>
 );
}

