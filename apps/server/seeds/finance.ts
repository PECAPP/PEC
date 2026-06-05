import { prisma, daysAgo, daysFromNow } from './utils';
import type { StudentSeed } from './data';

function receiptNo() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PEC-${ts}-${rand}`;
}

const CURRENT_SEM = '2024-25 Even';
const CURRENT_MONTH = '2025-03';

export async function seedFinance(students: StudentSeed[]) {
  console.log('Seeding finance records...');
  let fees = 0, txns = 0;

  for (let i = 0; i < students.length; i++) {
    const s = students[i];

    // ── College Fee ──────────────────────────────────────────────────────────
    const collegeFeeStatus = i % 4 === 0 ? 'pending' : 'paid';
    const collegeFee = await prisma.feeRecord.create({
      data: {
        studentId: s.id,
        description: `Tuition & University Fee – ${CURRENT_SEM}`,
        category: 'college',
        amount: 42500,
        dueDate: daysFromNow(collegeFeeStatus === 'pending' ? 15 - i : -30),
        semester: CURRENT_SEM,
        status: collegeFeeStatus,
        paidDate: collegeFeeStatus === 'paid' ? daysAgo(20 + i) : null,
      },
    });
    fees++;

    if (collegeFeeStatus === 'paid') {
      await prisma.financeTransaction.create({
        data: {
          studentId: s.id,
          feeRecordId: collegeFee.id,
          amount: 42500,
          paymentMethod: i % 3 === 0 ? 'upi' : i % 3 === 1 ? 'neft' : 'online',
          status: 'success',
          gatewayTxnId: `GW-${Date.now()}-${i}`,
          receiptNo: receiptNo(),
          createdAt: daysAgo(20 + i),
        },
      });
      txns++;
    }

    // ── Hostel Fee ──────────────────────────────────────────────────────────
    const hostelFeeStatus = i % 3 === 1 ? 'pending' : 'paid';
    const hostelFee = await prisma.feeRecord.create({
      data: {
        studentId: s.id,
        description: `Hostel Accommodation Fee – ${CURRENT_SEM}`,
        category: 'hostel',
        amount: 22000,
        dueDate: daysFromNow(hostelFeeStatus === 'pending' ? 10 : -25),
        semester: CURRENT_SEM,
        status: hostelFeeStatus,
        paidDate: hostelFeeStatus === 'paid' ? daysAgo(15 + i) : null,
      },
    });
    fees++;

    if (hostelFeeStatus === 'paid') {
      await prisma.financeTransaction.create({
        data: {
          studentId: s.id,
          feeRecordId: hostelFee.id,
          amount: 22000,
          paymentMethod: 'online',
          status: 'success',
          gatewayTxnId: `GW-HOSTEL-${Date.now()}-${i}`,
          receiptNo: receiptNo(),
          createdAt: daysAgo(15 + i),
        },
      });
      txns++;
    }

    // ── Mess Fee (monthly) ──────────────────────────────────────────────────
    for (let m = 0; m < 3; m++) {
      const date = new Date();
      date.setMonth(date.getMonth() - m);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const messStatus = m === 0 && i % 5 === 0 ? 'pending' : 'paid';
      const messFee = await prisma.feeRecord.create({
        data: {
          studentId: s.id,
          description: `Mess Fee – ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
          category: 'mess',
          amount: 3800,
          dueDate: new Date(date.getFullYear(), date.getMonth() + 1, 5),
          month: monthStr,
          status: messStatus,
          paidDate: messStatus === 'paid' ? daysAgo(m * 28 + 5 + i % 7) : null,
        },
      });
      fees++;

      if (messStatus === 'paid') {
        await prisma.financeTransaction.create({
          data: {
            studentId: s.id,
            feeRecordId: messFee.id,
            amount: 3800,
            paymentMethod: m % 2 === 0 ? 'upi' : 'cash',
            status: 'success',
            receiptNo: receiptNo(),
            createdAt: daysAgo(m * 28 + 5 + i % 7),
          },
        });
        txns++;
      }
    }

    // ── Overdue exam fee for some students ──────────────────────────────────
    if (i % 7 === 0) {
      await prisma.feeRecord.create({
        data: {
          studentId: s.id,
          description: 'Examination Form Fee',
          category: 'exam',
          amount: 800,
          dueDate: daysAgo(10),
          semester: CURRENT_SEM,
          status: 'pending',
          lateFeeApplied: false,
        },
      });
      fees++;
    }
  }

  console.log(`  ✓ Created ${fees} fee records and ${txns} transactions`);
}
