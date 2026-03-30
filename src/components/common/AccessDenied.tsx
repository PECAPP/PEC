import React from 'react';
import { AlertTriangle, ArrowLeft, Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface AccessDeniedProps {
  message?: string;
  reason?: string;
  showContactAdmin?: boolean;
}

export default function AccessDenied({ 
  message = "Access Denied",
  reason = "You don't have permission to access this resource.",
  showContactAdmin = true 
}: AccessDeniedProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6 max-w-md px-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertTriangle className="w-16 h-16 text-destructive" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">{message}</h1>
          <p className="text-muted-foreground">{reason}</p>
        </div>

        {/* Suggested Actions */}
        <div className="space-y-3 pt-4">
          <p className="text-sm text-muted-foreground">What you can do:</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            
            <Button 
              onClick={() => router.push('/dashboard')}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </div>

          {showContactAdmin && (
            <div className="pt-4 border-t border-border mt-6">
              <p className="text-sm text-muted-foreground mb-2">
                Need access? Contact your administrator
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                className="gap-2"
                onClick={() => window.location.href = 'mailto:admin@institution.edu'}
              >
                <Mail className="w-4 h-4" />
                Contact Admin
              </Button>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="pt-6 text-xs text-muted-foreground">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  );
}
