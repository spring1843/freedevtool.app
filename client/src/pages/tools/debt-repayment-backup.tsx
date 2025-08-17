import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar } from 'recharts';
import { calculateDebtPayment, formatCurrency, formatMonthToYearMonth } from "@/lib/financial-tools";
import type { DebtPaymentResult } from "@/types/tools";
import { Calculator, CreditCard, Share, TrendingDown, BarChart3 } from "lucide-react";
import { getParam, updateURL, copyShareableURL } from "@/lib/url-sharing";
import { useToast } from "@/hooks/use-toast";
import { usePersistentForm } from "@/hooks/use-persistent-state";
import { SecurityBanner } from "@/components/ui/security-banner";
import AdSlot from "@/components/ui/ad-slot";

export default function DebtRepaymentCalculator() {
  const { fields, updateField } = usePersistentForm('debt-repayment', {
    principal: 25000,
    annualRate: 18.5,
    monthlyPayment: 800
  });

  const { principal, annualRate, monthlyPayment } = fields;
  const [result, setResult] = useState<DebtPaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load parameters from URL on initial load only
    const urlPrincipal = getParam('p', 0);
    const urlRate = getParam('r', 0);
    const urlPayment = getParam('mp', 0);
    
    // Only update if URL params exist
    if (urlPrincipal > 0) updateField('principal', urlPrincipal);
    if (urlRate > 0) updateField('annualRate', urlRate);
    if (urlPayment > 0) updateField('monthlyPayment', urlPayment);
  }, []);

  const calculate = () => {
    // Validate inputs
    if (principal <= 0) {
      setError('Principal amount must be greater than 0');
      setResult(null);
      return;
    }
    if (annualRate < 0) {
      setError('Interest rate cannot be negative');
      setResult(null);
      return;
    }
    if (monthlyPayment <= 0) {
      setError('Monthly payment must be greater than 0');
      setResult(null);
      return;
    }

    try {
      const calculation = calculateDebtPayment(principal, annualRate, monthlyPayment);
      setResult(calculation);
      setError(null);
      
      // Update URL with current parameters
      updateURL({ p: principal, r: annualRate, mp: monthlyPayment });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
      setResult(null);
    }
  };

  const shareCalculation = async () => {
    const success = await copyShareableURL({ p: principal, r: annualRate, mp: monthlyPayment });
    if (success) {
      toast({
        title: "Calculation shared!",
        description: "URL copied to clipboard with current debt settings",
      });
    } else {
      toast({
        title: "Share failed",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  // Prepare chart data for visualization
  const chartData = result?.monthlyBreakdown
    .filter((_, index) => index % 6 === 0 || index === result.monthlyBreakdown.length - 1) // Show every 6 months + final month
    .map((month, index, filteredArray) => {
      // Calculate cumulative interest up to this month
      const monthIndex = month.month - 1; // Convert to 0-based index
      const cumulativeInterest = result.monthlyBreakdown
        .slice(0, monthIndex + 1)
        .reduce((sum, m) => sum + m.interest, 0);
      
      return {
        month: month.month,
        monthLabel: formatMonthToYearMonth(month.month),
        balance: Math.round(month.balance),
        payment: Math.round(month.payment),
        principal: Math.round(month.principal),
        interest: Math.round(month.interest),
        cumulative_interest: Math.round(cumulativeInterest)
      };
    }) || [];

  const balanceChartData = result?.monthlyBreakdown
    .filter((_, index) => index % 3 === 0 || index === result.monthlyBreakdown.length - 1) // Show every 3 months for smoother line
    .map(month => ({
      month: month.month,
      monthLabel: formatMonthToYearMonth(month.month),
      balance: Math.round(month.balance),
      originalBalance: principal
    })) || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="DR-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Debt Repayment Calculator
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Calculate debt payoff timeline and total interest with different payment amounts - designed for offline use
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Middle Ad */}
        <div className="xl:col-span-3 flex justify-center mb-6">
          <AdSlot position="middle" id="DR-002" size="medium" />
        </div>
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Debt Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="debt-principal">Total Debt Amount ($)</Label>
              <Input
                id="debt-principal"
                type="number"
                min="0"
                step="100"
                value={principal}
                onChange={(e) => updateField('principal', Number(e.target.value) || 0)}
                data-testid="debt-principal-input"
              />
            </div>
            
            <div>
              <Label htmlFor="debt-rate">Annual Interest Rate (%)</Label>
              <Input
                id="debt-rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={annualRate}
                onChange={(e) => updateField('annualRate', Number(e.target.value) || 0)}
                data-testid="debt-rate-input"
              />
            </div>
            
            <div>
              <Label htmlFor="debt-payment">Monthly Payment ($)</Label>
              <Input
                id="debt-payment"
                type="number"
                min="0"
                step="10"
                value={monthlyPayment}
                onChange={(e) => updateField('monthlyPayment', Number(e.target.value) || 0)}
                data-testid="debt-payment-input"
              />
            </div>

            {error ? <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm rounded">
                <strong>Error:</strong> {error}
              </div> : null}

            <div className="space-y-2">
              <Button onClick={calculate} className="w-full" data-testid="calculate-debt-button">
                <CreditCard className="w-4 h-4 mr-2" />
                Calculate Debt Payoff
              </Button>
              
              {result ? <Button 
                  onClick={shareCalculation} 
                  variant="outline" 
                  className="w-full" 
                  data-testid="share-debt-calculation-button"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share Calculation
                </Button> : null}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Payoff Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Payoff Time
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="payoff-months">
                      {result.totalPayments} months
                    </div>
                    <div className="text-sm text-slate-500">
                      ({result.payoffTime.toFixed(1)} years)
                    </div>
                  </div>
                  
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Total Interest
                    </div>
                    <div className="text-lg font-semibold text-red-600 dark:text-red-400" data-testid="total-interest">
                      {formatCurrency(result.totalInterest)}
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Total Paid
                    </div>
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(principal + result.totalInterest)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                Enter your debt parameters and click "Calculate" to see payoff schedule
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visualization Section - Balance Reduction Chart */}
        {result ? <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingDown className="w-5 h-5 mr-2" />
                Debt Balance Reduction Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={balanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="monthLabel" 
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === 'balance' ? 'Remaining Balance' : 'Original Debt'
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px'
                      }}
                    />
                    <defs>
                      <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke="#ef4444"
                      strokeWidth={3}
                      fill="url(#balanceGradient)"
                      name="balance"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card> : null}
      </div>

      {/* Payment Breakdown Chart */}
      {result ? <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Payment Breakdown Analysis
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                See how your payments are split between principal and interest over time
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="monthLabel" 
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = {
                          principal: 'Principal Payment',
                          interest: 'Interest Payment',
                          cumulative_interest: 'Total Interest Paid'
                        };
                        return [formatCurrency(value), labels[name] || name];
                      }}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="principal" stackId="payment" fill="#22c55e" name="Principal Payment" />
                    <Bar dataKey="interest" stackId="payment" fill="#ef4444" name="Interest Payment" />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative_interest" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Total Interest Paid"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Insights */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                  <div className="flex items-center text-green-700 dark:text-green-400 text-sm font-medium mb-1">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2" />
                    Principal Payments
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-300">
                    Reduces your actual debt balance and builds equity
                  </p>
                </div>
                
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                  <div className="flex items-center text-red-700 dark:text-red-400 text-sm font-medium mb-1">
                    <div className="w-3 h-3 bg-red-500 rounded mr-2" />
                    Interest Payments
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-300">
                    Cost of borrowing - decreases as balance reduces
                  </p>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
                  <div className="flex items-center text-amber-700 dark:text-amber-400 text-sm font-medium mb-1">
                    <div className="w-3 h-3 bg-amber-500 rounded mr-2" />
                    Cumulative Interest
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-300">
                    Total interest paid to date - grows slower over time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div> : null}

      {/* Monthly Schedule Table */}
      {result ? <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Payment Schedule</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Detailed breakdown showing the last 12 months of payments
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {result.monthlyBreakdown.slice(-12).map((month) => (
                    <div
                      key={month.month}
                      className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-700 rounded"
                      data-testid={`month-${month.month}`}
                    >
                      <div className="font-medium">{formatMonthToYearMonth(month.month)}</div>
                      <div className="text-right text-sm space-y-1">
                        <div>Balance: <span className="font-medium">{formatCurrency(month.balance)}</span></div>
                        <div className="flex space-x-4 text-xs">
                          <span className="text-green-600 dark:text-green-400">
                            Principal: {formatCurrency(month.principal)}
                          </span>
                          <span className="text-red-600 dark:text-red-400">
                            Interest: {formatCurrency(month.interest)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div> : null}

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="DR-003" size="large" />
      </div>
    </div>
  );
}