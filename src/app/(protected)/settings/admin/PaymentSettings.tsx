import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import router from 'next/router';

type PaymentMethod = 'razorpay' | 'upi' | 'bank';

interface PaymentConfig {
  method: PaymentMethod;
  razorpay?: {
    apiKey: string;
    apiSecret: string;
  };
  upi?: {
    upiId: string;
    upiName: string;
  };
  bank?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
  };
  isActive: boolean;
  lastUpdated: any;
  updatedBy: string;
}

const extractData = <T,>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
};

interface Props {
  embedded?: boolean;
}

export default function PaymentSettings({ embedded }: Props) {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PaymentConfig | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [showApiSecret, setShowApiSecret] = useState(false);

  // UPI fields
  const [upiId, setUpiId] = useState('');
  const [upiName, setUpiName] = useState('');

  // Bank fields
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branch, setBranch] = useState('');

  // Razorpay fields
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      router.replace('/auth');
      return;
    }

    fetchPaymentSettings();
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    if (settings) {
      setMethod(settings.method);
      if (settings.method === 'razorpay' && settings.razorpay) {
        setApiKey(settings.razorpay.apiKey);
        setApiSecret(settings.razorpay.apiSecret);
      } else if (settings.method === 'upi' && settings.upi) {
        setUpiId(settings.upi.upiId);
        setUpiName(settings.upi.upiName);
      } else if (settings.method === 'bank' && settings.bank) {
        setBankName(settings.bank.bankName);
        setAccountName(settings.bank.accountName);
        setAccountNumber(settings.bank.accountNumber);
        setIfscCode(settings.bank.ifscCode);
        setBranch(settings.bank.branch);
      }
    }
  }, [settings]);

  const fetchPaymentSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/feature-flags/payment-config');
      const flag = extractData<any>(response.data);
      const payload = flag?.payload ? JSON.parse(flag.payload) : null;
      if (payload) {
        setSettings(payload as PaymentConfig);
      } else {
        setSettings(null);
        setMethod('upi');
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      toast.error('Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (method === 'upi') {
      if (!upiId.trim() || !upiName.trim()) {
        toast.error('Please fill in UPI ID and Name');
        return;
      }
      if (!upiId.includes('@')) {
        toast.error('Invalid UPI ID format (should be like 9876543210@ybl)');
        return;
      }
    } else if (method === 'bank') {
      if (!bankName.trim() || !accountName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
        toast.error('Please fill in all bank details');
        return;
      }
    } else if (method === 'razorpay') {
      if (!apiKey.trim() || !apiSecret.trim()) {
        toast.error('Please fill in API Key and Secret');
        return;
      }
    }

    try {
      setSaving(true);
      const newConfig: PaymentConfig = {
        method,
        isActive: true,
        lastUpdated: new Date().toISOString(),
        updatedBy: user?.email || 'unknown',
      };

      if (method === 'upi') {
        newConfig.upi = {
          upiId: upiId.trim(),
          upiName: upiName.trim(),
        };
      } else if (method === 'bank') {
        newConfig.bank = {
          bankName: bankName.trim(),
          accountName: accountName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim(),
          branch: branch.trim(),
        };
      } else if (method === 'razorpay') {
        newConfig.razorpay = {
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
        };
      }

      await api.post('/feature-flags/payment-config', {
        enabled: true,
        description: 'Campus payment gateway configuration',
        payload: JSON.stringify(newConfig),
      });

      setSettings(newConfig);
      toast.success(`Payment method updated to ${method.toUpperCase()}`);
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast.error('Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Back Button */}
      {!embedded && (
        <Button variant="ghost" onClick={() => router.push('/finance' as any)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Finance
        </Button>
      )}

      {/* Header */}
      {!embedded && (
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payment Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure how students will pay fees
          </p>
        </div>
      )}

      {/* Current Status */}
      {settings && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-foreground capitalize">
                  Current: {settings.method} Payment
                </p>
                <p className="text-sm text-muted-foreground">
                  Last updated: {settings.lastUpdated ? new Date(settings.lastUpdated).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Payment Method</CardTitle>
          <CardDescription>
            Select which payment method your students will use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={method} onValueChange={(val) => setMethod(val as PaymentMethod)}>
            <div className="space-y-4">
              {/* UPI Option */}
              <div className={cn(
                'p-4 rounded-lg border-2 cursor-pointer transition-all',
                method === 'upi'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-border/80'
              )}>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="upi" id="upi-radio" className="mt-1" />
                  <div className="flex-1">
                    <label htmlFor="upi-radio" className="font-semibold text-foreground cursor-pointer">
                      UPI Payment ⚡
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Simple & Direct - Students scan QR or click button to pay via UPI app
                    </p>
                    <Badge variant="outline" className="mt-2">
                      0% Commission
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Bank Option */}
              <div className={cn(
                'p-4 rounded-lg border-2 cursor-pointer transition-all',
                method === 'bank'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-border/80'
              )}>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="bank" id="bank-radio" className="mt-1" />
                  <div className="flex-1">
                    <label htmlFor="bank-radio" className="font-semibold text-foreground cursor-pointer">
                      Bank Transfer 🏦
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manual - Students transfer to your bank account and upload proof for verification
                    </p>
                    <Badge variant="outline" className="mt-2">
                      0% Commission | Manual Verification
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Razorpay Option */}
              <div className={cn(
                'p-4 rounded-lg border-2 cursor-pointer transition-all',
                method === 'razorpay'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-border/80'
              )}>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="razorpay" id="razorpay-radio" className="mt-1" />
                  <div className="flex-1">
                    <label htmlFor="razorpay-radio" className="font-semibold text-foreground cursor-pointer">
                      Razorpay Payment 💳
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Professional - Cards, UPI, NetBanking, Wallets. Auto-verified payments.
                    </p>
                    <Badge variant="outline" className="mt-2">
                      0% for UPI | 0.5-2% for others
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Configuration Forms */}
      <Card>
        <CardHeader>
          <CardTitle>
            {method === 'upi' ? 'UPI Configuration' : method === 'bank' ? 'Bank Details Configuration' : 'Razorpay Configuration'}
          </CardTitle>
          <CardDescription>
            {method === 'upi'
              ? 'Your UPI ID for receiving payments'
              : method === 'bank'
              ? 'Your bank account details for student transfers'
              : 'Your Razorpay API credentials (get from https://razorpay.com)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {method === 'upi' ? (
            <>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  UPI ID *
                </label>
                <Input
                  placeholder="9876543210@ybl"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: phone@bankname (e.g., 9876543210@ybl, 9876543210@okhdfcbank)
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Your Name *
                </label>
                <Input
                  placeholder="Ananay Dubey"
                  value={upiName}
                  onChange={(e) => setUpiName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  How your name appears in payment apps
                </p>
              </div>

              {/* Preview */}
              {upiId && upiName && (
                <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Preview:</p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Name:</span> {upiName}
                    </p>
                    <p className="text-sm font-mono">
                      <span className="font-medium">UPI:</span> {upiId}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : method === 'bank' ? (
            <>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Bank Name *
                </label>
                <Input
                  placeholder="State Bank of India"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Account Holder Name *
                </label>
                <Input
                  placeholder="Your Name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Account Number *
                </label>
                <Input
                  placeholder="1234567890123456"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  IFSC Code *
                </label>
                <Input
                  placeholder="SBIN0001234"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Branch
                </label>
                <Input
                  placeholder="University Campus Branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
              </div>

              {/* Preview */}
              {bankName && accountNumber && (
                <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Preview:</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Bank:</span> {bankName}</p>
                    <p><span className="font-medium">Account:</span> {accountName}</p>
                    <p className="font-mono"><span className="font-medium">Number:</span> {accountNumber}</p>
                    <p className="font-mono"><span className="font-medium">IFSC:</span> {ifscCode}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Razorpay API Key *
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="rzp_live_xxxxxxxxxxxxx"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(apiKey, 'API Key')}
                    disabled={!apiKey}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Get from Razorpay Dashboard → Settings → API Keys
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Razorpay API Secret *
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                    type={showApiSecret ? 'text' : 'password'}
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiSecret(!showApiSecret)}
                  >
                    {showApiSecret ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(apiSecret, 'API Secret')}
                    disabled={!apiSecret}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep this secret! Never share publicly
                </p>
              </div>

              {/* Info Box */}
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-200">
                    <p className="font-medium">Get Razorpay credentials:</p>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Visit <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">razorpay.com</a></li>
                      <li>Sign up (free account)</li>
                      <li>Go to Settings → API Keys</li>
                      <li>Copy Key ID and Key Secret</li>
                    </ol>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Warning Box */}
      <Card className="border-yellow-200/50 bg-yellow-50/50 dark:border-yellow-800/50 dark:bg-yellow-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
            <div className="text-sm text-yellow-900 dark:text-yellow-200">
              <p className="font-medium">Important:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Changing payment method will affect future payments</li>
                <li>Students will see the configured method on payment page</li>
                <li>Keep your credentials secure</li>
                {method === 'razorpay' && <li>Razorpay will verify payments automatically</li>}
                {method === 'upi' && <li>You&apos;ll need to verify UPI payments in your bank</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Configuration
            </>
          )}
        </Button>
        {!embedded && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/finance' as any)}
          >
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
}
