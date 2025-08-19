import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  calculateDebtPayment,
  calculateMultipleDebts,
  formatCurrency,
} from "@/lib/financial-tools";
import type { DebtPaymentResult } from "@/types/tools";
import { Calculator, Plus, Trash2, Target, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Debt {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minimumPayment: number;
}

export default function EnhancedDebtRepaymentCalculator() {
  const [debts, setDebts] = useState<Debt[]>([
    {
      id: "1",
      name: "Credit Card 1",
      balance: 15000,
      rate: 18.5,
      minimumPayment: 300,
    },
    {
      id: "2",
      name: "Credit Card 2",
      balance: 8000,
      rate: 22.9,
      minimumPayment: 200,
    },
    {
      id: "3",
      name: "Personal Loan",
      balance: 12000,
      rate: 12.5,
      minimumPayment: 250,
    },
  ]);
  const [totalPayment, setTotalPayment] = useState(1000);
  const [strategy, setStrategy] = useState<
    "avalanche" | "snowball" | "balanced"
  >("avalanche");
  const [multipleResult, setMultipleResult] = useState<{
    monthsToPayoff: number;
    totalInterestPaid: number;
    totalAmountPaid: number;
    debtPayoffOrder: Array<{
      name: string;
      balance: number;
      rate: number;
      minimumPayment: number;
      isPaidOff: boolean;
      monthPaidOff: number;
    }>;
    monthlySummary: Array<{
      month: number;
      totalBalance: number;
      totalPayment: number;
      totalInterest: number;
      debts: Array<{
        name: string;
        balance: number;
        rate: number;
        minimumPayment: number;
        isPaidOff: boolean;
      }>;
    }>;
    strategy: string;
  } | null>(null);
  const [singleDebt, setSingleDebt] = useState({
    balance: 25000,
    rate: 18.5,
    payment: 800,
  });
  const [singleResult, setSingleResult] = useState<DebtPaymentResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const addDebt = () => {
    const newDebt: Debt = {
      id: Date.now().toString(),
      name: `Debt ${debts.length + 1}`,
      balance: 5000,
      rate: 15.0,
      minimumPayment: 150,
    };
    setDebts([...debts, newDebt]);
  };

  const updateDebt = (
    id: string,
    field: keyof Debt,
    value: string | number
  ) => {
    setDebts(
      debts.map(debt => (debt.id === id ? { ...debt, [field]: value } : debt))
    );
  };

  const removeDebt = (id: string) => {
    if (debts.length > 1) {
      setDebts(debts.filter(debt => debt.id !== id));
    }
  };

  const calculateMultiple = () => {
    if (debts.length === 0 || totalPayment <= 0) return;

    const totalMinPayments = debts.reduce(
      (sum, debt) => sum + debt.minimumPayment,
      0
    );
    if (totalPayment < totalMinPayments) {
      setError(
        `Total payment must be at least $${totalMinPayments.toFixed(2)} to cover minimum payments`
      );
      return;
    }

    try {
      const result = calculateMultipleDebts(debts, totalPayment, strategy);
      setMultipleResult(result);
      setError(null);
      toast({
        title: "Calculation Complete",
        description: `All debts will be paid off in ${result.monthsToPayoff} months using ${strategy} strategy.`,
      });
    } catch {
      setError("Calculation failed");
      setMultipleResult(null);
    }
  };

  const calculateSingle = () => {
    if (
      singleDebt.balance > 0 &&
      singleDebt.rate >= 0 &&
      singleDebt.payment > 0
    ) {
      try {
        const calculation = calculateDebtPayment(
          singleDebt.balance,
          singleDebt.rate,
          singleDebt.payment
        );
        setSingleResult(calculation);
        setError(null);
      } catch {
        setError("Calculation failed");
        setSingleResult(null);
      }
    }
  };

  const strategyDescriptions = {
    avalanche:
      "Pay minimums on all debts, then put extra money toward the highest interest rate debt first.",
    snowball:
      "Pay minimums on all debts, then put extra money toward the smallest balance debt first.",
    balanced:
      "Balanced approach considering both interest rate and balance size.",
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Enhanced Debt Repayment Calculator
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Compare debt repayment strategies and calculate optimal payoff
          schedules for multiple debts
        </p>
      </div>

      <Tabs defaultValue="multiple" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="multiple" data-testid="multiple-debts-tab">
            Multiple Debts
          </TabsTrigger>
          <TabsTrigger value="single" data-testid="single-debt-tab">
            Single Debt
          </TabsTrigger>
        </TabsList>

        {/* Multiple Debts Tab */}
        <TabsContent value="multiple" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Debt Configuration
                  </span>
                  <Button
                    onClick={addDebt}
                    size="sm"
                    data-testid="add-debt-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Debt
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="max-h-96">
                  <div className="space-y-4">
                    {debts.map((debt, index) => (
                      <div
                        key={debt.id}
                        className="p-4 border border-slate-200 dark:border-slate-700 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <Input
                            value={debt.name}
                            onChange={e =>
                              updateDebt(debt.id, "name", e.target.value)
                            }
                            className="max-w-32"
                            data-testid={`debt-name-${index}`}
                          />
                          {debts.length > 1 && (
                            <Button
                              onClick={() => removeDebt(debt.id)}
                              variant="ghost"
                              size="sm"
                              data-testid={`remove-debt-${index}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <Label>Balance ($)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="100"
                              value={debt.balance}
                              onChange={e =>
                                updateDebt(
                                  debt.id,
                                  "balance",
                                  Number(e.target.value) || 0
                                )
                              }
                              data-testid={`debt-balance-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Interest Rate (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={debt.rate}
                              onChange={e =>
                                updateDebt(
                                  debt.id,
                                  "rate",
                                  Number(e.target.value) || 0
                                )
                              }
                              data-testid={`debt-rate-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Minimum Payment ($)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="10"
                              value={debt.minimumPayment}
                              onChange={e =>
                                updateDebt(
                                  debt.id,
                                  "minimumPayment",
                                  Number(e.target.value) || 0
                                )
                              }
                              data-testid={`debt-min-payment-${index}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="total-payment">
                      Total Monthly Payment ($)
                    </Label>
                    <Input
                      id="total-payment"
                      type="number"
                      min="0"
                      step="50"
                      value={totalPayment}
                      onChange={e =>
                        setTotalPayment(Number(e.target.value) || 0)
                      }
                      data-testid="total-payment-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="strategy">Repayment Strategy</Label>
                    <Select
                      value={strategy}
                      onValueChange={(
                        value: "avalanche" | "snowball" | "balanced"
                      ) => setStrategy(value)}
                    >
                      <SelectTrigger data-testid="strategy-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="avalanche">
                          Avalanche (Highest Interest First)
                        </SelectItem>
                        <SelectItem value="snowball">
                          Snowball (Smallest Balance First)
                        </SelectItem>
                        <SelectItem value="balanced">
                          Balanced Approach
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-slate-500 mt-1">
                      {strategyDescriptions[strategy]}
                    </div>
                  </div>

                  {error ? (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm">
                      {error}
                    </div>
                  ) : null}

                  <Button
                    onClick={calculateMultiple}
                    className="w-full"
                    data-testid="calculate-multiple-button"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Calculate Payoff Strategy
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle>Payoff Strategy Results</CardTitle>
              </CardHeader>
              <CardContent>
                {multipleResult ? (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 border border-slate-200 dark:border-slate-700">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          Total Payoff Time
                        </div>
                        <div
                          className="text-2xl font-bold text-green-600 dark:text-green-400"
                          data-testid="payoff-months"
                        >
                          {multipleResult.monthsToPayoff} months (
                          {(multipleResult.monthsToPayoff / 12).toFixed(1)}{" "}
                          years)
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-slate-200 dark:border-slate-700">
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            Total Interest
                          </div>
                          <div
                            className="text-lg font-semibold text-blue-600 dark:text-blue-400"
                            data-testid="total-interest-multiple"
                          >
                            {formatCurrency(multipleResult.totalInterestPaid)}
                          </div>
                        </div>

                        <div className="p-4 border border-slate-200 dark:border-slate-700">
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            Strategy Used
                          </div>
                          <div className="text-lg font-semibold capitalize">
                            {multipleResult.strategy}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payoff Order */}
                    {multipleResult.debtPayoffOrder ? (
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                          Debt Payoff Order
                        </h4>
                        <div className="space-y-2">
                          {multipleResult.debtPayoffOrder.map(
                            (
                              debt: {
                                name: string;
                                balance: number;
                                rate: number;
                                minimumPayment: number;
                                isPaidOff: boolean;
                                monthPaidOff: number;
                              },
                              index: number
                            ) => (
                              <div
                                key={`${debt.name}-${index}`}
                                className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700"
                                data-testid={`payoff-order-${index}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{index + 1}</Badge>
                                  <span className="font-medium">
                                    {debt.name}
                                  </span>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  {debt.monthPaidOff <= 12
                                    ? `Year 1 ${new Date(2024, (debt.monthPaidOff - 1) % 12).toLocaleDateString("en-US", { month: "short" })} (Month ${debt.monthPaidOff})`
                                    : `Year ${Math.floor((debt.monthPaidOff - 1) / 12) + 1} ${new Date(2024, (debt.monthPaidOff - 1) % 12).toLocaleDateString("en-US", { month: "short" })} (Month ${debt.monthPaidOff})`}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : null}

                    {/* Complete Monthly Progress */}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Complete Monthly Breakdown
                      </h4>
                      <ScrollArea className="h-80">
                        <div className="space-y-2">
                          {multipleResult.monthlySummary.map(
                            (month: {
                              month: number;
                              totalBalance: number;
                              totalPayment: number;
                              totalInterest: number;
                              debts: Array<{
                                name: string;
                                balance: number;
                                rate: number;
                                minimumPayment: number;
                                isPaidOff: boolean;
                              }>;
                            }) => {
                              const yearNum =
                                Math.floor((month.month - 1) / 12) + 1;
                              const monthNum = ((month.month - 1) % 12) + 1;
                              const monthName = new Date(
                                2024,
                                monthNum - 1
                              ).toLocaleDateString("en-US", { month: "short" });

                              return (
                                <div
                                  key={month.month}
                                  className="p-3 border border-slate-200 dark:border-slate-700"
                                  data-testid={`month-summary-${month.month}`}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">
                                      Year {yearNum} {monthName} (Month{" "}
                                      {month.month})
                                    </span>
                                    <span className="text-sm">
                                      Remaining:{" "}
                                      {formatCurrency(month.totalBalance)}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-600 dark:text-slate-400">
                                    {
                                      month.debts.filter(
                                        (d: { isPaidOff: boolean }) =>
                                          !d.isPaidOff
                                      ).length
                                    }{" "}
                                    debts remaining
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                    Configure your debts and click "Calculate" to see your
                    optimal payoff strategy
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Single Debt Tab */}
        <TabsContent value="single" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Single Debt Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Single Debt Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="single-balance">Debt Balance ($)</Label>
                  <Input
                    id="single-balance"
                    type="number"
                    min="0"
                    step="100"
                    value={singleDebt.balance}
                    onChange={e =>
                      setSingleDebt({
                        ...singleDebt,
                        balance: Number(e.target.value) || 0,
                      })
                    }
                    data-testid="single-balance-input"
                  />
                </div>

                <div>
                  <Label htmlFor="single-rate">Annual Interest Rate (%)</Label>
                  <Input
                    id="single-rate"
                    type="number"
                    min="0"
                    step="0.1"
                    value={singleDebt.rate}
                    onChange={e =>
                      setSingleDebt({
                        ...singleDebt,
                        rate: Number(e.target.value) || 0,
                      })
                    }
                    data-testid="single-rate-input"
                  />
                </div>

                <div>
                  <Label htmlFor="single-payment">Monthly Payment ($)</Label>
                  <Input
                    id="single-payment"
                    type="number"
                    min="0"
                    step="10"
                    value={singleDebt.payment}
                    onChange={e =>
                      setSingleDebt({
                        ...singleDebt,
                        payment: Number(e.target.value) || 0,
                      })
                    }
                    data-testid="single-payment-input"
                  />
                </div>

                <Button
                  onClick={calculateSingle}
                  className="w-full"
                  data-testid="calculate-single-button"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Single Debt Payoff
                </Button>
              </CardContent>
            </Card>

            {/* Single Debt Results */}
            <Card>
              <CardHeader>
                <CardTitle>Payoff Results</CardTitle>
              </CardHeader>
              <CardContent>
                {singleResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 border border-slate-200 dark:border-slate-700">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          Payoff Time
                        </div>
                        <div
                          className="text-2xl font-bold text-green-600 dark:text-green-400"
                          data-testid="single-payoff-months"
                        >
                          {singleResult.totalPayments} months (
                          {singleResult.payoffTime.toFixed(1)} years)
                        </div>
                      </div>

                      <div className="p-4 border border-slate-200 dark:border-slate-700">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          Total Interest
                        </div>
                        <div
                          className="text-lg font-semibold text-blue-600 dark:text-blue-400"
                          data-testid="single-total-interest"
                        >
                          {formatCurrency(singleResult.totalInterest)}
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
                          {singleResult.monthlyBreakdown
                            .slice(-12)
                            .map(month => (
                              <div
                                key={month.month}
                                className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-700"
                                data-testid={`single-month-${month.month}`}
                              >
                                <div className="font-medium">
                                  Month {month.month}
                                </div>
                                <div className="text-right text-sm">
                                  <div>
                                    Balance: {formatCurrency(month.balance)}
                                  </div>
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
                    Enter your debt parameters and click "Calculate" to see
                    payoff schedule
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
