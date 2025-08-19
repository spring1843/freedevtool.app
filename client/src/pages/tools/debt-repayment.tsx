import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, RotateCcw, CreditCard, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { SecurityBanner } from "@/components/ui/security-banner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface PaymentSchedule {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

interface DebtResult {
  totalPayments: number;
  totalInterest: number;
  payoffTime: number; // in months
  schedule: PaymentSchedule[];
}

export default function DebtRepaymentCalculator() {
  const [principal, setPrincipal] = useState(25000);
  const [annualRate, setAnnualRate] = useState(18.5);
  const [monthlyPayment, setMonthlyPayment] = useState(800);
  const [result, setResult] = useState<DebtResult | null>(null);

  const calculateDebtRepayment = () => {
    const monthlyRate = annualRate / 100 / 12;
    let remainingBalance = principal;
    let month = 0;
    let totalInterest = 0;
    const schedule: PaymentSchedule[] = [];

    while (remainingBalance > 0.01 && month < 600) {
      // Max 50 years protection
      month++;

      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = Math.min(
        monthlyPayment - interestPayment,
        remainingBalance
      );
      const actualPayment = interestPayment + principalPayment;

      remainingBalance -= principalPayment;
      totalInterest += interestPayment;

      schedule.push({
        month,
        payment: actualPayment,
        principal: principalPayment,
        interest: interestPayment,
        remainingBalance: Math.max(0, remainingBalance),
      });

      if (principalPayment <= 0) {
        // Payment too low to cover interest
        break;
      }
    }

    const debtResult: DebtResult = {
      totalPayments: schedule.reduce(
        (sum, payment) => sum + payment.payment,
        0
      ),
      totalInterest,
      payoffTime: month,
      schedule: schedule.slice(0, 60), // Show first 5 years max
    };

    setResult(debtResult);
  };

  const handleReset = () => {
    setPrincipal(25000);
    setAnnualRate(18.5);
    setMonthlyPayment(800);
    setResult(null);
  };

  useEffect(() => {
    calculateDebtRepayment();
  }, [calculateDebtRepayment]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const formatTime = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${months} months`;
    if (remainingMonths === 0) return `${years} years`;
    return `${years} years, ${remainingMonths} months`;
  };

  const minimumPayment = principal * (annualRate / 100 / 12);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Debt Repayment Calculator
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Calculate debt payoff timeline and interest savings
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Debt Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="principal">Total Debt Amount</Label>
              <Input
                id="principal"
                type="number"
                value={principal}
                onChange={e => setPrincipal(Number(e.target.value))}
                placeholder="Total debt amount"
              />
            </div>

            <div>
              <Label htmlFor="annual-rate">Annual Interest Rate (%)</Label>
              <Input
                id="annual-rate"
                type="number"
                step="0.1"
                value={annualRate}
                onChange={e => setAnnualRate(Number(e.target.value))}
                placeholder="Annual interest rate"
              />
            </div>

            <div>
              <Label htmlFor="monthly-payment">Monthly Payment</Label>
              <Input
                id="monthly-payment"
                type="number"
                value={monthlyPayment}
                onChange={e => setMonthlyPayment(Number(e.target.value))}
                placeholder="Monthly payment amount"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Minimum payment: {formatCurrency(minimumPayment)}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={calculateDebtRepayment}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculate
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {result ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payoff Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatTime(result.payoffTime)}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">
                    Payoff Time
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(result.totalInterest)}
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    Total Interest
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Badge variant="outline" className="w-full justify-between p-2">
                  <span>Original Debt:</span>
                  <span className="font-semibold">
                    {formatCurrency(principal)}
                  </span>
                </Badge>
                <Badge variant="outline" className="w-full justify-between p-2">
                  <span>Total Payments:</span>
                  <span className="font-semibold">
                    {formatCurrency(result.totalPayments)}
                  </span>
                </Badge>
                <Badge variant="outline" className="w-full justify-between p-2">
                  <span>Interest Paid:</span>
                  <span className="font-semibold">
                    {formatCurrency(result.totalInterest)}
                  </span>
                </Badge>
              </div>

              {monthlyPayment <= minimumPayment && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Warning: Your payment may not cover the minimum interest.
                    Consider increasing your monthly payment.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>

      {result && result.schedule.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule (First 5 Years)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Month</th>
                      <th className="text-right p-2">Payment</th>
                      <th className="text-right p-2">Principal</th>
                      <th className="text-right p-2">Interest</th>
                      <th className="text-right p-2">Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map(payment => (
                      <tr key={payment.month} className="border-b">
                        <td className="p-2 font-medium">{payment.month}</td>
                        <td className="text-right p-2">
                          {formatCurrency(payment.payment)}
                        </td>
                        <td className="text-right p-2 text-green-600">
                          {formatCurrency(payment.principal)}
                        </td>
                        <td className="text-right p-2 text-red-600">
                          {formatCurrency(payment.interest)}
                        </td>
                        <td className="text-right p-2 font-semibold">
                          {formatCurrency(payment.remainingBalance)}
                        </td>
                      </tr>
                    ))}
                    {result.payoffTime > 60 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center p-4 text-gray-500 italic"
                        >
                          ... and {result.payoffTime - 60} more months
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Debt Payoff Progress Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={result.schedule.map((item, index) => ({
                      month:
                        index % 12 === 0
                          ? `Year ${Math.floor(index / 12) + 1}`
                          : `${index + 1}`,
                      "Remaining Balance": Math.round(item.remainingBalance),
                      "Principal Payment": Math.round(item.principal),
                      "Interest Payment": Math.round(item.interest),
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={value => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `$${value.toLocaleString()}`,
                        "",
                      ]}
                      labelStyle={{ color: "#000" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Remaining Balance"
                      stroke="#dc2626"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={result.schedule.slice(0, 24).map((item, index) => ({
                        month: `Month ${index + 1}`,
                        Principal: Math.round(item.principal),
                        Interest: Math.round(item.interest),
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10 }}
                        interval={5}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={value => `$${value}`}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          `$${value.toLocaleString()}`,
                          "",
                        ]}
                        labelStyle={{ color: "#000" }}
                      />
                      <Bar dataKey="Principal" stackId="a" fill="#10b981" />
                      <Bar dataKey="Interest" stackId="a" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-600 rounded mr-2" />
                  <span>Remaining Balance</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2" />
                  <span>Principal Payment</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-amber-500 rounded mr-2" />
                  <span>Interest Payment</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
