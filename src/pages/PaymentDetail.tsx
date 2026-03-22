import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CreditCard,
  Building,
  QrCode,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { doc, getDoc, updateDoc, serverTimestamp } from '@/lib/dataClient';
import api from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2, Smartphone } from 'lucide-react';
import { 
  generateUPILink, 
  initiateUPIPayment, 
  generateUPIQRCode,
  isMobile 
} from '@/lib/upiPayment';
import { getUPIConfig, generateTransactionId } from '@/config/upi';

const extractData = <T,>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
};

interface Invoice {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  category: 'tuition' | 'hostel' | 'exam' | 'library' | 'other';
  breakdown?: { item: string; amount: number }[];
}

// No static invoices needed here anymore

const bankDetails = {
  bankName: 'State Bank of India',
  accountName: 'PEC Education Trust',
  accountNumber: '1234567890123456',
  ifscCode: 'SBIN0001234',
  branch: 'University Campus Branch',
};

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);
  const [qrTimeLeft, setQrTimeLeft] = useState(300); // 5 minutes in seconds
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [verificationMode, setVerificationMode] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [verificationImage, setVerificationImage] = useState<File | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        if (!id) return;
        
        // Fetch invoice
        const docRef = doc(({} as any), 'feeRecords', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // RBAC check
          if (!isAdmin && data.studentId !== user.uid) {
            toast.error('Unauthorized access');
            navigate('/finance');
            return;
          }
          setInvoice({ id: docSnap.id, ...data });
        } else {
          toast.error('Invoice not found');
        }

        try {
          const settingsRes = await api.get('/feature-flags/payment-config');
          const flag = extractData<any>(settingsRes.data);
          const payload = flag?.payload ? JSON.parse(flag.payload) : null;
          if (payload) {
            setPaymentSettings(payload);
          } else {
            setPaymentSettings({
              method: 'upi',
              upi: getUPIConfig(),
            });
          }
        } catch {
          setPaymentSettings({
            method: 'upi',
            upi: getUPIConfig(),
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (invoice?.status !== 'paid' && showPaymentOptions) {
      // Generate QR code when payment options are shown
      generateQRCode();
      
      const timer = setInterval(() => {
        setQrTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [invoice?.status, showPaymentOptions]);

  const generateQRCode = async () => {
    if (!invoice || !paymentSettings) return;
    
    try {
      // Only generate QR for UPI method
      if (paymentSettings.method === 'upi') {
        const upiLink = generateUPILink({
          merchantId: paymentSettings.upi.upiId,
          merchantName: paymentSettings.upi.upiName,
          transactionId: generateTransactionId(),
          amount: invoice.amount,
          description: invoice.description,
        });
        
        const qrUrl = await generateUPIQRCode(upiLink);
        setQrCodeUrl(qrUrl);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const refreshQR = () => {
    setQrTimeLeft(300);
    generateQRCode();
    toast.success('QR code refreshed');
  };

  const handleUPIPayment = async () => {
    if (!invoice || !id || !user || !paymentSettings) return;
    
    try {
      setProcessingPayment(true);
      
      const transactionId = generateTransactionId();
      const upiLink = generateUPILink({
        merchantId: paymentSettings.upi.upiId,
        merchantName: paymentSettings.upi.upiName,
        transactionId,
        amount: invoice.amount,
        description: invoice.description,
      });
      
      // Store transaction reference for later verification
      const docRef = doc(({} as any), 'feeRecords', id);
      await updateDoc(docRef, {
        pendingTransactionId: transactionId,
        lastPaymentAttempt: serverTimestamp(),
      });
      
      // Open UPI payment link
      await initiateUPIPayment(upiLink);
      
      // On mobile, the app will handle the payment
      // On desktop, show a message about scanning QR
      if (!isMobile()) {
        toast.info('Please scan the QR code with your UPI app');
      }
      
      // Start polling for payment confirmation
      pollPaymentStatus(id, 3);
      
    } catch (error) {
      console.error('Error initiating UPI payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const pollPaymentStatus = (invoiceId: string, maxAttempts: number, attempt: number = 0) => {
    if (attempt >= maxAttempts) {
      toast.info('Payment verification in progress. Please check after 24-48 hours.');
      return;
    }

    const pollTimeout = setTimeout(async () => {
      try {
        const docRef = doc(({} as any), 'feeRecords', invoiceId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status === 'paid') {
            setInvoice({ id: docSnap.id, ...data });
            setShowPaymentOptions(false);
            toast.success('Payment successful!');
            return;
          }
        }
        
        // Keep polling
        pollPaymentStatus(invoiceId, maxAttempts, attempt + 1);
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 3000); // Poll every 3 seconds
  };

  const handleConfirmPayment = async () => {
    if (!id || !user) return;
    
    try {
      setLoading(true);
      const docRef = doc(({} as any), 'feeRecords', id);
      
      // For Razorpay: mark as paid immediately
      // For UPI/Bank: mark as pending_verification
      const newStatus = paymentSettings?.method === 'razorpay' ? 'paid' : 'pending_verification';
      
      await updateDoc(docRef, {
        status: newStatus,
        paidDate: newStatus === 'paid' ? serverTimestamp() : null,
        paymentTransactionId: transactionId || null,
        verificationSubmittedAt: serverTimestamp(),
      });
      
      setInvoice({
        ...invoice,
        status: newStatus,
        paidDate: newStatus === 'paid' ? { seconds: Math.floor(Date.now() / 1000) } : null
      });
      
      if (newStatus === 'paid') {
        toast.success('Payment confirmed successfully!');
      } else {
        toast.success('Payment submitted for verification. Admin will review shortly.');
      }
      setShowPaymentOptions(false);
      setVerificationMode(false);
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <CreditCard className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Invoice not found</h2>
        <Button variant="outline" onClick={() => navigate('/finance')} className="mt-4">
          Back to Finance
        </Button>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid': return { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Paid' };
      case 'pending': return { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'Pending' };
      case 'pending_verification': return { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/20', label: 'Pending Verification' };
      case 'overdue': return { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Overdue' };
      default: return { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unknown' };
    }
  };

  const statusConfig = getStatusConfig(invoice.status);
  const StatusIcon = statusConfig.icon;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateValue: any): string => {
    if (!dateValue) return '';
    if (dateValue.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString();
    }
    if (typeof dateValue === 'string') {
      return new Date(dateValue).toLocaleDateString();
    }
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/finance')} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Finance
      </Button>

      {/* Header */}
      <div className="card-elevated p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{invoice.description}</h1>
              <Badge className={cn(statusConfig.bg, statusConfig.color, 'border-0')}>
                <StatusIcon className="w-3.5 h-3.5 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">Invoice ID: {invoice.id}</p>
            <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
              <span>Due Date: {invoice.dueDate?.seconds ? new Date(invoice.dueDate.seconds * 1000).toLocaleDateString() : invoice.dueDate}</span>
              {invoice.paidDate && <span>Paid: {invoice.paidDate?.seconds ? new Date(invoice.paidDate.seconds * 1000).toLocaleDateString() : invoice.paidDate}</span>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-4xl font-bold text-foreground">₹{invoice.amount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Invoice Details */}
        <div className="card-elevated p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Invoice Breakdown</h2>
          {invoice.breakdown ? (
            <div className="space-y-3">
              {invoice.breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{item.item}</span>
                  <span className="font-medium text-foreground">₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-foreground text-xl">₹{invoice.amount.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{invoice.description}</span>
              <span className="font-bold text-foreground">₹{invoice.amount.toLocaleString()}</span>
            </div>
          )}
          
          {invoice.status === 'paid' && (
            <Button variant="outline" className="w-full mt-6">
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
          )}
        </div>

        {/* Payment Section */}
        {invoice.status !== 'paid' && (
          <div className="card-elevated p-6">
            {!showPaymentOptions ? (
              <div className="text-center py-8">
                <div className={cn('w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4', statusConfig.bg)}>
                  <StatusIcon className={cn('w-8 h-8', statusConfig.color)} />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Payment Required</h2>
                <p className="text-muted-foreground mb-6">Complete your payment to avoid late fees</p>
                <Button className="w-full" size="lg" onClick={() => setShowPaymentOptions(true)}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now - ₹{invoice.amount.toLocaleString()}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground">
                  {paymentSettings?.method === 'razorpay' ? 'Pay with Razorpay' : 'Payment Method'}
                </h2>
                
                {/* UPI Payment - Show only if configured */}
                {paymentSettings?.method === 'upi' && (
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-foreground flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-primary" />
                        UPI Payment
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-sm font-medium',
                          qrTimeLeft < 60 ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                          {formatTime(qrTimeLeft)}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refreshQR}>
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      {qrCodeUrl ? (
                        <img 
                          src={qrCodeUrl} 
                          alt="UPI QR Code" 
                          className="w-48 h-48 rounded-xl mb-4 border border-border"
                        />
                      ) : (
                        <div className="w-48 h-48 bg-background rounded-xl flex items-center justify-center mb-4 border border-border animate-pulse">
                          <QrCode className="w-32 h-32 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        {isMobile() 
                          ? 'Tap the button below to open your UPI app' 
                          : 'Scan with any UPI app to pay'}
                      </p>
                      
                      {/* UPI Deep Link Button - Works on Mobile */}
                      {isMobile() && (
                        <Button 
                          className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={handleUPIPayment}
                          disabled={processingPayment || qrTimeLeft === 0}
                        >
                          <Smartphone className="w-4 h-4 mr-2" />
                          {processingPayment ? 'Opening UPI App...' : 'Pay with UPI'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Razorpay Payment - Show only if configured */}
                {paymentSettings?.method === 'razorpay' && (
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                    <p className="text-muted-foreground mb-4">
                      Pay securely with Razorpay. Choose from multiple payment methods.
                    </p>
                    <Button className="w-full" size="lg" disabled>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Razorpay Integration (Coming Soon)
                    </Button>
                  </div>
                )}

                {/* Bank Transfer - Show only if configured */}
                {paymentSettings?.method === 'bank' && (
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                    {!verificationMode ? (
                      <>
                        <h3 className="font-medium text-foreground flex items-center gap-2 mb-4">
                          <Building className="w-5 h-5 text-primary" />
                          Bank Transfer Details
                        </h3>
                        
                        <div className="space-y-3 mb-4">
                          {paymentSettings.bank && [
                            { label: 'Bank Name', value: paymentSettings.bank.bankName },
                            { label: 'Account Name', value: paymentSettings.bank.accountName },
                            { label: 'Account Number', value: paymentSettings.bank.accountNumber },
                            { label: 'IFSC Code', value: paymentSettings.bank.ifscCode },
                            ...(paymentSettings.bank.branch ? [{ label: 'Branch', value: paymentSettings.bank.branch }] : []),
                          ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                                <p className="text-sm font-medium text-foreground">{item.value}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => copyToClipboard(item.value, item.label)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <Button 
                          className="w-full"
                          onClick={() => setVerificationMode(true)}
                        >
                          Proceed to Submit Payment Proof
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="font-medium text-foreground mb-4">Submit Payment Proof</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-foreground block mb-2">
                              Transaction ID / Reference Number *
                            </label>
                            <Input
                              placeholder="e.g., TXN123456789"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Find this in your bank app after making the transfer
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground block mb-2">
                              Upload Payment Screenshot (Optional)
                            </label>
                            <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-secondary/50">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setVerificationImage(e.target.files?.[0] || null)}
                                className="hidden"
                                id="file-upload"
                              />
                              <label htmlFor="file-upload" className="cursor-pointer">
                                <p className="text-sm text-muted-foreground">
                                  {verificationImage ? verificationImage.name : 'Click to upload or drag image here'}
                                </p>
                              </label>
                            </div>
                          </div>

                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-900 dark:text-blue-200">
                              ℹ️ Admin will verify your payment using the transaction ID and screenshot. You'll receive confirmation via email.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <Button 
                  className="w-full h-12 text-lg font-semibold bg-success hover:bg-success/90 text-white" 
                  onClick={handleConfirmPayment} 
                  disabled={processingPayment || (paymentSettings?.method === 'bank' && verificationMode && !transactionId)}
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : paymentSettings?.method === 'bank' && verificationMode ? (
                    'Submit for Verification'
                  ) : (
                    'Confirm Payment'
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  After payment through UPI, we'll verify your transaction automatically.
                  Manual verification may take 24-48 hours for bank transfers.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Paid Status */}
        {invoice.status === 'paid' && (
          <div className="card-elevated p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Payment Complete</h2>
              <p className="text-muted-foreground mb-2">Paid on {formatDate(invoice.paidDate)}</p>
              <p className="text-sm text-muted-foreground">Transaction ID: TXN{invoice.id.replace('INV-', '')}2024</p>
            </div>
          </div>
        )}

        {/* Pending Verification Status */}
        {invoice.status === 'pending_verification' && (
          <div className="card-elevated p-6 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
              </div>
              <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Payment Pending Verification</h2>
              <p className="text-yellow-800 dark:text-yellow-300 mb-4">
                Your payment has been submitted and is awaiting admin verification. This usually takes 24-48 hours.
              </p>
              {invoice.paymentTransactionId && (
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Transaction ID: {invoice.paymentTransactionId}
                </p>
              )}
              <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-4">
                You'll receive an email confirmation once the payment is verified.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
