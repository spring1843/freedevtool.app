import type { CompoundInterestResult, DebtPaymentResult } from "@/types/tools";

// Calculate compound interest with enhanced features
export function calculateCompoundInterest(
  principal: number,
  annualRate: number,
  years: number,
  monthlyContribution = 0,
  contributionFrequency: "monthly" | "yearly" = "monthly",
  interestFrequency: "monthly" | "yearly" = "monthly"
): CompoundInterestResult {
  const monthlyRate = annualRate / 100 / 12;
  const yearlyRate = annualRate / 100;
  const totalMonths = years * 12;
  const monthlyBreakdown = [];

  let balance = principal;
  let totalInterest = 0;
  let totalContributions = 0;
  const milestones: Array<{
    month: number;
    balance: number;
    multiple: number;
  }> = [];

  for (let month = 1; month <= totalMonths; month++) {
    // Calculate interest based on frequency
    let interestThisMonth = 0;
    if (interestFrequency === "monthly") {
      interestThisMonth = balance * monthlyRate;
    } else if (interestFrequency === "yearly" && month % 12 === 0) {
      interestThisMonth = balance * yearlyRate;
    }

    balance += interestThisMonth;
    totalInterest += interestThisMonth;

    // Add contributions based on frequency
    let contributionThisMonth = 0;
    if (contributionFrequency === "monthly") {
      contributionThisMonth = monthlyContribution;
    } else if (contributionFrequency === "yearly" && month % 12 === 0) {
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
    throw new Error("Monthly payment must be greater than 0");
  }

  const monthlyRate = annualRate / 100 / 12;
  let balance = principal;
  let totalInterest = 0;
  const monthlyBreakdown = [];
  let month = 0;

  // Check if payment covers interest
  const minimumPayment = balance * monthlyRate;
  if (monthlyPayment <= minimumPayment && monthlyRate > 0) {
    throw new Error(
      "Monthly payment must be higher than the monthly interest to pay off the debt"
    );
  }

  while (balance > 0.01 && month < 1000) {
    // Safety limit
    month++;

    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(
      monthlyPayment - interestPayment,
      balance
    );

    if (principalPayment <= 0) {
      throw new Error("Payment too low to reduce principal");
    }

    balance -= principalPayment;
    totalInterest += interestPayment;

    monthlyBreakdown.push({
      month,
      payment: Math.min(
        monthlyPayment,
        interestPayment + balance + principalPayment
      ),
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

  const monthlyPayment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  return monthlyPayment;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
