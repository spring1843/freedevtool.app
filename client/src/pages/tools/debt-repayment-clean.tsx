import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calculateDebtPayment, formatCurrency } from "@/lib/financial-tools";
import type { DebtPaymentResult } from "@/types/tools";
import { Calculator, CreditCard } from "lucide-react";

export default function DebtRepaymentCalculator() {
  const [principal, setPrincipal] = useState(25000);
  const [annualRate, setAnnualRate] = useState(18.5);
  const [monthlyPayment, setMonthlyPayment] = useState(800);
  const [result, setResult] = useState<DebtPaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    if (principal > 0 && annualRate >= 0 && monthlyPayment > 0) {
      try {
        const calculation = calculateDebtPayment(
          principal,
          annualRate,
          monthlyPayment
        );
        setResult(calculation);
        setError(null);
      } catch {
        setError("Calculation failed");
        setResult(null);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Debt Repayment Calculator
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Calculate debt payoff timeline and total interest with different
          payment amounts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                onChange={e => setPrincipal(Number(e.target.value) || 0)}
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
                onChange={e => setAnnualRate(Number(e.target.value) || 0)}
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
                onChange={e => setMonthlyPayment(Number(e.target.value) || 0)}
                data-testid="debt-payment-input"
              />
            </div>

            {error ? (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm">
                {error}
              </div>
            ) : null}

            <Button
              onClick={calculate}
              className="w-full"
              data-testid="calculate-debt-button"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Calculate Debt Payoff
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Payoff Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 border border-slate-200 dark:border-slate-700">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Payoff Time
                    </div>
                    <div
                      className="text-2xl font-bold text-green-600 dark:text-green-400"
                      data-testid="payoff-months"
                    >
                      {result.totalPayments} months (
                      {result.payoffTime.toFixed(1)} years)
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 dark:border-slate-700">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Total Interest
                    </div>
                    <div
                      className="text-lg font-semibold text-blue-600 dark:text-blue-400"
                      data-testid="total-interest"
                    >
                      {formatCurrency(result.totalInterest)}
                    </div>
                  </div>
                </div>

                {/* Monthly Breakdown */}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Monthly Breakdown (Last 12 months)
                  </h4>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {result.monthlyBreakdown.slice(-12).map(month => (
                        <div
                          key={month.month}
                          className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-700"
                          data-testid={`month-${month.month}`}
                        >
                          <div className="font-medium">Month {month.month}</div>
                          <div className="text-right text-sm">
                            <div>Balance: {formatCurrency(month.balance)}</div>
                            <div className="text-slate-600 dark:text-slate-400">
                              Payment: {formatCurrency(month.payment)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                Enter your debt parameters and click "Calculate" to see payoff
                schedule
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
