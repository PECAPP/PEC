import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Info, Loader2, CheckCircle2 } from 'lucide-react';
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from '@pec/ui';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FeeRecord } from '../types';
import { fmt } from '../constants';
import api from '@pec/api';

export default function PaymentDialog({
  fee,
  open,
  onClose,
  onSuccess,
}: {
  fee: FeeRecord | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [_loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'done'>('form');
  const [receiptNo, setReceiptNo] = useState('');

  useEffect(() => {
    if (open) {
      setStep('form');
      setUpiId('');
      setMethod('upi');
    }
  }, [open]);

  if (!fee) return null;
  const total = fee.amount + (fee.lateFeeAmount ?? 0);

  const handlePay = async () => {
    if (method === 'upi' && !upiId.trim()) {
      toast.error('Please enter your UPI ID');
      return;
    }
    setLoading(true);
    setStep('processing');
    try {
      // Simulate gateway delay
      await new Promise((r) => setTimeout(r, 1800));
      const res = await api.post('/finance/pay', {
        feeRecordId: fee.id,
        paymentMethod: method,
        gatewayTxnId: `SIM-${method.toUpperCase()}-${Date.now()}`,
        notes: upiId ? `UPI ID: ${upiId}` : undefined,
      });
      setReceiptNo((res as any).data?.transaction?.receiptNo ?? '');
      setStep('done');
      onSuccess();
    } catch {
      toast.error('Payment failed. Please try again.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className=" border-0 bg-transparent shadow-none p-0">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-card rounded-sm overflow-hidden border border-white/10 shadow-2xl relative"
        >
          {/* Glassmorphic Background Blur Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          
          <div className="p-6 relative z-10">
            <DialogHeader className="mb-6">
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-primary/10 rounded-sm">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                Complete Payment
              </DialogTitle>
            </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Sleek Invoice Preview */}
              <div className="relative rounded-sm bg-muted/30 border border-border/50 p-5 space-y-3 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <h3 className="text-sm font-semibold text-foreground/90">{fee.description}</h3>
                
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Amount</span>
                    <span className="font-medium">₹{fmt(fee.amount)}</span>
                  </div>
                  {fee.lateFeeAmount > 0 && (
                    <div className="flex justify-between text-sm text-red-500">
                      <span>Late Fee</span>
                      <span className="font-medium">+₹{fmt(fee.lateFeeAmount)}</span>
                    </div>
                  )}
                </div>
                
                {/* Dotted separator for receipt look */}
                <div className="border-t-2 border-dashed border-border/50 my-2" />
                
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Due</span>
                  <span className="text-primary text-3xl font-bold tracking-tight">₹{fmt(total)}</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['upi', 'neft', 'dd'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={cn(
                        'py-2 px-3 rounded-sm border text-sm font-medium transition-colors',
                        method === m
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      {m.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {method === 'upi' && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">UPI ID</label>
                  <Input
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-start gap-2 p-3 rounded-sm bg-blue-500/10 border border-blue-500/20">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-600">
                  This is a simulated payment in test mode. No real money will be charged.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handlePay}>
                  Pay ₹{fmt(total)}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-6 py-12"
            >
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Outer rotating ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/50"
                />
                {/* Inner pulsing ring */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="absolute inset-2 rounded-full border border-primary/30"
                />
                <CreditCard className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent"
                >
                  Processing Payment
                </motion.p>
                <p className="text-sm text-muted-foreground">Securing your transaction...</p>
              </div>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-6 py-8"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="relative w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
              >
                <motion.div
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 1, pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </motion.div>
              </motion.div>
              
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-emerald-600 tracking-tight">Payment Successful!</p>
                <div className="bg-muted/50 rounded-sm p-4 inline-block mt-2 min-w-[200px]">
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="text-xl font-bold text-foreground">₹{fmt(total)}</p>
                  {receiptNo && (
                    <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Receipt</span>
                      <span className="font-mono font-medium">{receiptNo}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={onClose} className="w-full h-10 mt-4 rounded-sm shadow-glow bg-primary hover:bg-primary/90 text-primary-foreground">
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
