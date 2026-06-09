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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Pay Fee
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
              {/* Fee summary */}
              <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-2">
                <p className="text-sm font-medium">{fee.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Amount</span>
                  <span>₹{fmt(fee.amount)}</span>
                </div>
                {fee.lateFeeAmount > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>Late Fee</span>
                    <span>+₹{fmt(fee.lateFeeAmount)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary text-lg">₹{fmt(total)}</span>
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
                        'py-2 px-3 rounded-lg border text-sm font-medium transition-colors',
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

              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <p className="font-medium">Processing Payment…</p>
              <p className="text-sm text-muted-foreground">Please wait, do not close this window</p>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-emerald-600">Payment Successful!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ₹{fmt(total)} paid successfully
                </p>
                {receiptNo && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Receipt: <span className="font-mono font-medium">{receiptNo}</span>
                  </p>
                )}
              </div>
              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
