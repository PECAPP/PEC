import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  GraduationCap, 
  Users, 
  Building2, 
  Loader2,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole } from '@/types';

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  icon: any;
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    value: 'student',
    label: 'Student',
    description: 'Access courses, attendance, grades, and placement opportunities',
    icon: GraduationCap,
    color: 'bg-foreground'
  },
  {
    value: 'faculty',
    label: 'Faculty',
    description: 'Manage courses, record attendance, grade students, and view reports',
    icon: Users,
    color: 'bg-foreground/80'
  },
  {
    value: 'college_admin',
    label: 'College Admin',
    description: 'Manage institution, users, departments, and financial operations',
    icon: Building2,
    color: 'bg-foreground/60'
  }
];

export default function RoleSelection() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const apiUrl = useMemo(
    () =>
      (import.meta.env.VITE_API_URL as string) ||
      (import.meta.env.DEV ? 'http://localhost:3001' : 'http://localhost:3001'),
    [],
  );

  const handleRoleSelect = async () => {
    if (!selectedRole || !token || !user?.id) return;

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/set-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      toast.success(`Role set to ${roleOptions.find(r => r.value === selectedRole)?.label}!`, {
        description: 'Complete your profile to get started.',
      });

      navigate('/onboarding');
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role. Please try again.');
      setLoading(false);
    }
  };

  if (!token || !user?.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please login to select your role.</p>
          <Button onClick={() => navigate('/auth')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
          >
            <GraduationCap className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Choose Your Role</h1>
          <p className="text-muted-foreground">
            Select the role that best describes you to personalize your experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {roleOptions.map((role, index) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.value;

            return (
              <motion.div
                key={role.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected
                      ? 'ring-2 ring-primary shadow-lg scale-105'
                      : 'hover:scale-102'
                  }`}
                  onClick={() => setSelectedRole(role.value)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className={`w-12 h-12 rounded-lg ${role.color} flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6 text-background" />
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        </motion.div>
                      )}
                    </div>
                    <CardTitle className="text-xl">{role.label}</CardTitle>
                    <CardDescription className="text-sm">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent />
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            disabled={!selectedRole || loading}
            onClick={handleRoleSelect}
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Setting up...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          You can update your role later in settings if needed
        </p>
      </motion.div>
    </div>
  );
}
