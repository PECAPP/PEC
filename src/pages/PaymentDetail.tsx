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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

const invoices: Invoice[] = [
  { 
    id: 'INV-001', 
    description: 'Tuition Fee - Fall 2024', 
    amount: 45000, 
    dueDate: '2024-01-15', 
    status: 'paid', 
    paidDate: '2024-01-10', 
    category: 'tuition',
    breakdown: [
      { item: 'Tuition Fee', amount: 40000 },
      { item: 'Development Fee', amount: 3000 },
      { item: 'Library Fee', amount: 2000 },
    ]
  },
  { 
    id: 'INV-002', 
    description: 'Hostel Fee - Semester 5', 
    amount: 18000, 
    dueDate: '2024-01-20', 
    status: 'pending', 
    category: 'hostel',
    breakdown: [
      { item: 'Room Rent', amount: 12000 },
      { item: 'Mess Charges', amount: 5000 },
      { item: 'Maintenance', amount: 1000 },
    ]
  },
  { 
    id: 'INV-003', 
    description: 'Examination Fee', 
    amount: 2500, 
    dueDate: '2024-01-05', 
    status: 'overdue', 
    category: 'exam',
    breakdown: [
      { item: 'Exam Registration', amount: 2000 },
      { item: 'Late Fee', amount: 500 },
    ]
  },
  { id: 'INV-004', description: 'Library Fine', amount: 150, dueDate: '2024-01-25', status: 'pending', category: 'library' },
  { id: 'INV-005', description: 'Lab Equipment Fee', amount: 3500, dueDate: '2023-12-15', status: 'paid', paidDate: '2023-12-12', category: 'other' },
];

const bankDetails = {
  bankName: 'State Bank of India',
  accountName: 'OmniFlow Education Trust',
  accountNumber: '1234567890123456',
  ifscCode: 'SBIN0001234',
  branch: 'University Campus Branch',
};

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qrTimeLeft, setQrTimeLeft] = useState(300); // 5 minutes in seconds
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  
  const invoice = invoices.find(inv => inv.id === id);

  useEffect(() => {
    if (invoice?.status !== 'paid' && showPaymentOptions) {
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

  const refreshQR = () => {
    setQrTimeLeft(300);
    toast.success('QR code refreshed');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

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
              <span>Due Date: {invoice.dueDate}</span>
              {invoice.paidDate && <span>Paid: {invoice.paidDate}</span>}
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
                <h2 className="text-lg font-semibold text-foreground">Payment Options</h2>
                
                {/* UPI QR Code */}
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
                    <div className="w-48 h-48 bg-background rounded-xl flex items-center justify-center mb-4 border border-border">
                      <QrCode className="w-32 h-32 text-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Scan with any UPI app to pay
                    </p>
                    <p className="text-xs text-primary mt-1">upi://pay?pa=OmniFlow@sbi&am={invoice.amount}</p>
                  </div>
                </div>

                {/* Bank Transfer */}
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <h3 className="font-medium text-foreground flex items-center gap-2 mb-4">
                    <Building className="w-5 h-5 text-primary" />
                    Bank Transfer
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { label: 'Bank Name', value: bankDetails.bankName },
                      { label: 'Account Name', value: bankDetails.accountName },
                      { label: 'Account Number', value: bankDetails.accountNumber },
                      { label: 'IFSC Code', value: bankDetails.ifscCode },
                      { label: 'Branch', value: bankDetails.branch },
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
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Payment confirmation may take 24-48 hours after bank transfer
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
              <p className="text-muted-foreground mb-2">Paid on {invoice.paidDate}</p>
              <p className="text-sm text-muted-foreground">Transaction ID: TXN{invoice.id.replace('INV-', '')}2024</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
