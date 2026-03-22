import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHasPermission } from '@/features/auth/hooks/useAuth';
import { RolePermissions } from '@/features/auth/lib/rolePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: keyof RolePermissions;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, requiredPermission, fallback }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const hasPermission = requiredPermission ? useHasPermission(requiredPermission) : true;

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <CardTitle>Authentication Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You need to be signed in to access this resource.
              </p>
              <Button onClick={() => navigate('/auth', { replace: true })} className="w-full">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  if (requiredPermission && !hasPermission) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Lock className="w-12 h-12 text-destructive mx-auto mb-4" />
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-destructive/10 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
                </p>
              </div>
              <Button onClick={() => navigate('/dashboard', { replace: true })} className="w-full">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
