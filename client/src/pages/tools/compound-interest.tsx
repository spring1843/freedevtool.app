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
import { Badge } from "@/components/ui/badge";
import { Calculator, RotateCcw, TrendingUp, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import AdSlot from "@/components/ui/ad-slot";
import { SecurityBanner } from "@/components/ui/security-banner";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface CompoundInterestResult {
  finalAmount: number;
  totalContributions: number;
  totalInterest: number;
  yearlyBreakdown: Array<{
    year: number;
    startingAmount: number;
    contributions: number;
    interest: number;
    endingAmount: number;
  }>;
}

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(10000);
  const [annualRate, setAnnualRate] = useState(12);
  const [years, setYears] = useState(20);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [contributionFrequency, setContributionFrequency] = useState<
    "monthly" | "yearly"
  >("monthly");
  const [interestFrequency, setInterestFrequency] = useState<
    "monthly" | "yearly"
  >("yearly");
  const [result, setResult] = useState<CompoundInterestResult | null>(null);

  const calculateCompoundInterest = () => {
    const monthlyRate = annualRate / 100 / 12;
    const yearlyRate = annualRate / 100;

    let currentAmount = principal;
    const yearlyBreakdown: CompoundInterestResult["yearlyBreakdown"] = [];
    let totalContributions = principal;

    for (let year = 1; year <= years; year++) {
      const startingAmount = currentAmount;
      let yearContributions = 0;
      let yearInterest = 0;

      if (interestFrequency === "monthly") {
        // Monthly compounding
        for (let month = 0; month < 12; month++) {
          // Add monthly contribution
          if (contributionFrequency === "monthly") {
            currentAmount += monthlyContribution;
            yearContributions += monthlyContribution;
            totalContributions += monthlyContribution;
          }

          // Calculate monthly interest
          const monthlyInterest = currentAmount * monthlyRate;
          currentAmount += monthlyInterest;
          yearInterest += monthlyInterest;
        }

        // Add yearly contribution if frequency is yearly
        if (contributionFrequency === "yearly") {
          currentAmount += monthlyContribution * 12; // Use as yearly amount
          yearContributions += monthlyContribution * 12;
          totalContributions += monthlyContribution * 12;
        }
      } else {
        // Yearly compounding
        if (contributionFrequency === "yearly") {
          currentAmount += monthlyContribution * 12; // Use as yearly amount
          yearContributions += monthlyContribution * 12;
          totalContributions += monthlyContribution * 12;
        } else {
          currentAmount += monthlyContribution * 12; // Monthly contributions for the year
          yearContributions += monthlyContribution * 12;
          totalContributions += monthlyContribution * 12;
        }

        yearInterest = currentAmount * yearlyRate;
        currentAmount += yearInterest;
      }

      yearlyBreakdown.push({
        year,
        startingAmount,
        contributions: yearContributions,
        interest: yearInterest,
        endingAmount: currentAmount,
      });
    }

    const finalResult: CompoundInterestResult = {
      finalAmount: currentAmount,
      totalContributions: totalContributions - principal, // Exclude initial principal
      totalInterest: currentAmount - totalContributions,
      yearlyBreakdown,
    };

    setResult(finalResult);
  };

  const handleReset = () => {
    setPrincipal(10000);
    setAnnualRate(7);
    setYears(10);
    setMonthlyContribution(500);
    setContributionFrequency("monthly");
    setInterestFrequency("monthly");
    setResult(null);
  };

  useEffect(() => {
    calculateCompoundInterest();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const calculateNxTable = () => {
    if (!result) return [];

    const targetMultiples = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    const nxResults = [];

    for (const multiple of targetMultiples) {
      const targetAmount = principal * multiple;
      const reachedYear = result.yearlyBreakdown.find(
        year => year.endingAmount >= targetAmount
      );

      if (reachedYear) {
        nxResults.push({
          multiple: `${multiple}x`,
          targetAmount: formatCurrency(targetAmount),
          yearReached: reachedYear.year,
          actualAmount: formatCurrency(reachedYear.endingAmount),
        });
      } else {
        // Calculate when it would be reached beyond the current period
        let projectedYear = years;
        let projectedAmount = result.finalAmount;
        const yearlyRate = annualRate / 100;
        const yearlyContribution =
          contributionFrequency === "yearly"
            ? monthlyContribution * 12
            : monthlyContribution * 12;

        while (projectedAmount < targetAmount && projectedYear < 100) {
          projectedYear++;
          projectedAmount += yearlyContribution;
          projectedAmount *= 1 + yearlyRate;
        }

        if (projectedYear < 100) {
          nxResults.push({
            multiple: `${multiple}x`,
            targetAmount: formatCurrency(targetAmount),
            yearReached: projectedYear,
            actualAmount: formatCurrency(projectedAmount),
            projected: true,
          });
        } else {
          nxResults.push({
            multiple: `${multiple}x`,
            targetAmount: formatCurrency(targetAmount),
            yearReached: null,
            actualAmount: "Not reached",
            projected: true,
          });
        }
      }
    }

    return nxResults;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <AdSlot position="top" id="CI-001" size="large" className="mb-6" />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Compound Interest Calculator
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Calculate compound interest with regular contributions
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Investment Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="principal">Initial Investment</Label>
              <Input
                id="principal"
                type="number"
                value={principal}
                onChange={e => setPrincipal(Number(e.target.value))}
                placeholder="Initial amount"
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
                placeholder="Annual rate"
              />
            </div>

            <div>
              <Label htmlFor="years">Investment Period (Years)</Label>
              <Input
                id="years"
                type="number"
                value={years}
                onChange={e => setYears(Number(e.target.value))}
                placeholder="Number of years"
              />
            </div>

            <div>
              <Label htmlFor="contribution">Monthly Contribution</Label>
              <Input
                id="contribution"
                type="number"
                value={monthlyContribution}
                onChange={e => setMonthlyContribution(Number(e.target.value))}
                placeholder="Monthly amount"
              />
            </div>

            <div>
              <Label htmlFor="contribution-freq">Contribution Frequency</Label>
              <Select
                value={contributionFrequency}
                onValueChange={(value: "monthly" | "yearly") =>
                  setContributionFrequency(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="interest-freq">Compounding Frequency</Label>
              <Select
                value={interestFrequency}
                onValueChange={(value: "monthly" | "yearly") =>
                  setInterestFrequency(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={calculateCompoundInterest}
                className="bg-green-600 hover:bg-green-700 text-white"
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
                <TrendingUp className="w-5 h-5 mr-2" />
                Results Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(result.finalAmount)}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Final Amount
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(result.totalInterest)}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Total Interest
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Badge variant="outline" className="w-full justify-between p-2">
                  <span>Initial Investment:</span>
                  <span className="font-semibold">
                    {formatCurrency(principal)}
                  </span>
                </Badge>
                <Badge variant="outline" className="w-full justify-between p-2">
                  <span>Total Contributions:</span>
                  <span className="font-semibold">
                    {formatCurrency(result.totalContributions)}
                  </span>
                </Badge>
                <Badge variant="outline" className="w-full justify-between p-2">
                  <span>Interest Earned:</span>
                  <span className="font-semibold">
                    {formatCurrency(result.totalInterest)}
                  </span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {result && result.yearlyBreakdown.length > 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Investment Growth Chart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={result.yearlyBreakdown.map(item => ({
                    year: `Year ${item.year}`,
                    "Total Value": Math.round(item.endingAmount),
                    Contributions: Math.round(
                      result.yearlyBreakdown
                        .slice(0, item.year)
                        .reduce((sum, y) => sum + y.contributions, 0) +
                        principal
                    ),
                    "Interest Earned": Math.round(
                      item.endingAmount -
                        result.yearlyBreakdown
                          .slice(0, item.year)
                          .reduce((sum, y) => sum + y.contributions, 0) -
                        principal
                    ),
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
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
                  <Area
                    type="monotone"
                    dataKey="Contributions"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="Interest Earned"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2" />
                <span>Total Contributions</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2" />
                <span>Interest Earned</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle>Year-by-Year Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Year</th>
                    <th className="text-right p-2">Starting Amount</th>
                    <th className="text-right p-2">Contributions</th>
                    <th className="text-right p-2">Interest</th>
                    <th className="text-right p-2">Ending Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyBreakdown.map(row => (
                    <tr key={row.year} className="border-b">
                      <td className="p-2 font-medium">{row.year}</td>
                      <td className="text-right p-2">
                        {formatCurrency(row.startingAmount)}
                      </td>
                      <td className="text-right p-2 text-blue-600">
                        {formatCurrency(row.contributions)}
                      </td>
                      <td className="text-right p-2 text-green-600">
                        {formatCurrency(row.interest)}
                      </td>
                      <td className="text-right p-2 font-semibold">
                        {formatCurrency(row.endingAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {result ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              NX Table - Money Multiplication Milestones
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              See when your initial investment of {formatCurrency(principal)}{" "}
              will reach different multiples
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Multiple</th>
                    <th className="text-right p-3">Target Amount</th>
                    <th className="text-right p-3">Year Reached</th>
                    <th className="text-right p-3">Actual Amount</th>
                    <th className="text-center p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {calculateNxTable().map(row => (
                    <tr
                      key={row.multiple}
                      className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="p-3 font-bold text-lg text-blue-600 dark:text-blue-400">
                        {row.multiple}
                      </td>
                      <td className="text-right p-3 font-medium">
                        {row.targetAmount}
                      </td>
                      <td className="text-right p-3">
                        {row.yearReached ? (
                          <span
                            className={
                              row.projected
                                ? "text-orange-600 dark:text-orange-400"
                                : "text-green-600 dark:text-green-400"
                            }
                          >
                            Year {row.yearReached}
                          </span>
                        ) : (
                          <span className="text-red-500">N/A</span>
                        )}
                      </td>
                      <td className="text-right p-3 font-medium">
                        {row.actualAmount}
                      </td>
                      <td className="text-center p-3">
                        {row.yearReached ? (
                          row.projected ? (
                            <Badge
                              variant="outline"
                              className="text-orange-600 border-orange-300"
                            >
                              Projected
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-300"
                            >
                              Reached
                            </Badge>
                          )
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-red-500 border-red-300"
                          >
                            Beyond 100y
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div>
                •{" "}
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Reached
                </span>
                : Milestone achieved within your {years}-year investment period
              </div>
              <div>
                •{" "}
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  Projected
                </span>
                : Estimated timeline beyond your current investment period
              </div>
              <div>
                • <span className="text-red-500 font-medium">Beyond 100y</span>:
                Milestone would take more than 100 years to reach
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <AdSlot position="sidebar" id="CI-002" size="medium" className="mt-6" />
    </div>
  );
}
