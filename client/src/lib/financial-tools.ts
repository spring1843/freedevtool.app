import type { CompoundInterestResult, DebtPaymentResult } from '../types/tools';

// Calculate compound interest with enhanced features
export function calculateCompoundInterest(
  principal: number,
  annualRate: number,
  years: number,
  _compoundingFrequency = 12, // Monthly by default
  monthlyContribution = 0,
  contributionFrequency: 'monthly' | 'yearly' = 'monthly',
  interestFrequency: 'monthly' | 'yearly' = 'monthly'
): CompoundInterestResult {
  const monthlyRate = annualRate / 100 / 12;
  const yearlyRate = annualRate / 100;
  const totalMonths = years * 12;
  const monthlyBreakdown = [];

  let balance = principal;
  let totalInterest = 0;
  let totalContributions = 0;
  const milestones: Array<{ month: number; balance: number; multiple: number }> = [];

  for (let month = 1; month <= totalMonths; month++) {
    // Calculate interest based on frequency
    let interestThisMonth = 0;
    if (interestFrequency === 'monthly') {
      interestThisMonth = balance * monthlyRate;
    } else if (interestFrequency === 'yearly' && month % 12 === 0) {
      interestThisMonth = balance * yearlyRate;
    }

    balance += interestThisMonth;
    totalInterest += interestThisMonth;

    // Add contributions based on frequency
    let contributionThisMonth = 0;
    if (contributionFrequency === 'monthly') {
      contributionThisMonth = monthlyContribution;
    } else if (contributionFrequency === 'yearly' && month % 12 === 0) {
      contributionThisMonth = monthlyContribution * 12; // Assuming yearly contribution is 12x monthly
    }

    balance += contributionThisMonth;
    totalContributions += contributionThisMonth;

    // Check for milestones (2x, 3x, 4x, etc.)
    const multiple = Math.floor(balance / principal);
    if (multiple >= 2 && !milestones.some(m => m.multiple === multiple)) {
      milestones.push({ month, balance, multiple });
    }

    monthlyBreakdown.push({
      month,
      principal: principal + totalContributions,
      interest: totalInterest,
      balance,
      contribution: contributionThisMonth,
    });
  }

  return {
    finalAmount: balance,
    totalInterest,
    totalContributions,
    monthlyBreakdown,
    milestones: milestones.sort((a, b) => a.multiple - b.multiple),
  };
}

// Calculate debt repayment schedule
export function calculateDebtPayment(
  principal: number,
  annualRate: number,
  monthlyPayment: number
): DebtPaymentResult {
  if (monthlyPayment <= 0) {
    throw new Error('Monthly payment must be greater than 0');
  }

  const monthlyRate = annualRate / 100 / 12;
  let balance = principal;
  let totalInterest = 0;
  const monthlyBreakdown = [];
  let month = 0;

  // Check if payment covers interest (only if interest rate > 0)
  if (monthlyRate > 0) {
    const minimumInterestPayment = balance * monthlyRate;
    if (monthlyPayment <= minimumInterestPayment) {
      throw new Error(`Monthly payment ($${monthlyPayment.toFixed(2)}) must be higher than the monthly interest ($${minimumInterestPayment.toFixed(2)}) to pay off the debt`);
    }
  }

  while (balance > 0.01 && month < 1000) { // Safety limit
    month++;
    
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
    
    if (principalPayment <= 0) {
      throw new Error('Payment too low to reduce principal');
    }

    balance -= principalPayment;
    totalInterest += interestPayment;

    monthlyBreakdown.push({
      month,
      payment: Math.min(monthlyPayment, interestPayment + balance + principalPayment),
      principal: principalPayment,
      interest: interestPayment,
      balance,
    });
  }

  return {
    totalInterest,
    totalPayments: monthlyBreakdown.length,
    payoffTime: monthlyBreakdown.length / 12, // in years
    monthlyBreakdown,
  };
}

// Calculate minimum payment needed to pay off debt in specified time
export function calculateMinimumPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = years * 12;

  if (monthlyRate === 0) {
    return principal / totalMonths;
  }

  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  return monthlyPayment;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMonthToYearMonth(month: number): string {
  if (month <= 0) return "Month 0";
  
  const years = Math.floor((month - 1) / 12);
  const months = ((month - 1) % 12) + 1;
  
  if (years === 0) {
    return `Month ${months}`;
  } 
    return `Year ${years} Month ${months}`;
  
}

// Enhanced debt repayment calculation for multiple debts
export function calculateMultipleDebts(
  debts: Array<{ name: string; balance: number; rate: number; minimumPayment: number }>,
  totalPayment: number,
  strategy: 'avalanche' | 'snowball' | 'balanced' = 'avalanche'
) {
  const totalMinimum = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  
  if (totalPayment < totalMinimum) {
    throw new Error('Total payment must be at least the sum of minimum payments');
  }
  
  const extraPayment = totalPayment - totalMinimum;
  const sortedDebts = [...debts];
  
  // Sort based on strategy
  if (strategy === 'avalanche') {
    sortedDebts.sort((a, b) => b.rate - a.rate); // Highest rate first
  } else if (strategy === 'snowball') {
    sortedDebts.sort((a, b) => a.balance - b.balance); // Lowest balance first
  } else {
    // Balanced approach - combine rate and balance considerations
    sortedDebts.sort((a, b) => (b.rate / b.balance) - (a.rate / a.balance));
  }
  
  const debtPayoffOrder = [];
  const monthlySummary = [];
  let month = 0;
  const currentDebts = sortedDebts.map(debt => ({ ...debt, isPaidOff: false }));
  let remainingExtraPayment = extraPayment;
  
  while (currentDebts.some(debt => !debt.isPaidOff)) {
    month++;
    let monthlyInterest = 0;
    let monthlyPayments = 0;
    
    // Calculate interest and make minimum payments
    currentDebts.forEach(debt => {
      if (!debt.isPaidOff) {
        const monthlyInterestDebt = debt.balance * (debt.rate / 100 / 12);
        debt.balance += monthlyInterestDebt;
        monthlyInterest += monthlyInterestDebt;
        
        const payment = Math.min(debt.minimumPayment, debt.balance);
        debt.balance -= payment;
        monthlyPayments += payment;
        
        if (debt.balance <= 0) {
          debt.balance = 0;
          debt.isPaidOff = true;
          debtPayoffOrder.push({ ...debt, monthPaidOff: month });
        }
      }
    });
    
    // Apply extra payment to target debt
    const targetDebt = currentDebts.find(debt => !debt.isPaidOff);
    if (targetDebt && remainingExtraPayment > 0) {
      const extraPaymentAmount = Math.min(remainingExtraPayment, targetDebt.balance);
      targetDebt.balance -= extraPaymentAmount;
      monthlyPayments += extraPaymentAmount;
      
      if (targetDebt.balance <= 0) {
        remainingExtraPayment += targetDebt.minimumPayment; // Freed up minimum payment
        targetDebt.balance = 0;
        targetDebt.isPaidOff = true;
        debtPayoffOrder.push({ ...targetDebt, monthPaidOff: month });
      }
    }
    
    monthlySummary.push({
      month,
      totalBalance: currentDebts.reduce((sum, debt) => sum + debt.balance, 0),
      totalPayment: monthlyPayments,
      totalInterest: monthlyInterest,
      debts: [...currentDebts]
    });
    
    // Safety break
    if (month > 600) break; // Max 50 years
  }
  
  const totalInterestPaid = monthlySummary.reduce((sum, month) => sum + month.totalInterest, 0);
  const totalAmountPaid = monthlySummary.reduce((sum, month) => sum + month.totalPayment, 0);
  
  return {
    monthsToPayoff: month,
    totalInterestPaid,
    totalAmountPaid,
    debtPayoffOrder,
    monthlySummary,
    strategy
  };
}