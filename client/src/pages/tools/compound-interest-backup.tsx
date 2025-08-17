import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateCompoundInterest, formatCurrency, formatMonthToYearMonth } from "@/lib/financial-tools";
import type { CompoundInterestResult } from "@/types/tools";
import { Calculator, TrendingUp, DollarSign, Target, Share, RotateCcw } from "lucide-react";
import { updateURL, copyShareableURL, getValidatedParam } from "@/lib/url-sharing";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/ui/ad-slot";
import { usePersistentForm } from "@/hooks/use-persistent-state";

export default function CompoundInterestCalculator() {
  const { fields, updateField, resetFields } = usePersistentForm('compound-interest', {
    principal: 10000,
    annualRate: 7,
    years: 10,
    monthlyContribution: 500,
    contributionFrequency: 'monthly' as 'monthly' | 'yearly',
    interestFrequency: 'monthly' as 'monthly' | 'yearly',
    result: null as CompoundInterestResult | null
  });

  const { principal, annualRate, years, monthlyContribution, contributionFrequency, interestFrequency, result } = fields;
  const { toast } = useToast();

  useEffect(() => {
    // Load parameters from URL with validation
    const urlPrincipal = getValidatedParam('p', 10000, {
      type: 'number',
      min: 0,
      max: 100000000 // 100 million max
    });
    const urlRate = getValidatedParam('r', 7, {
      type: 'number', 
      min: -50,
      max: 1000 // Max 1000% annual rate
    });
    const urlYears = getValidatedParam('y', 10, {
      type: 'number',
      min: 1,
      max: 200 // Max 200 years
    });
    const urlContribution = getValidatedParam('c', 500, {
      type: 'number',
      min: 0,
      max: 10000000 // 10 million max
    });
    const urlContribFreq = getValidatedParam('cf', 'monthly', {
      type: 'enum',
      allowedValues: ['monthly', 'yearly']
    }) as 'monthly' | 'yearly';
    const urlInterestFreq = getValidatedParam('if', 'monthly', {
      type: 'enum',
      allowedValues: ['monthly', 'yearly']
    }) as 'monthly' | 'yearly';
    
    updateField('principal', urlPrincipal);
    updateField('annualRate', urlRate);
    updateField('years', urlYears);
    updateField('monthlyContribution', urlContribution);
    updateField('contributionFrequency', urlContribFreq);
    updateField('interestFrequency', urlInterestFreq);
    
    // Auto-calculate if URL params were provided
    if (urlPrincipal !== 10000 || urlRate !== 7 || urlYears !== 10) {
      setTimeout(() => calculate(), 100);
    }
  }, []);

  const calculate = () => {
    if (principal > 0 && annualRate >= 0 && years > 0) {
      try {
        const calculation = calculateCompoundInterest(
          principal,
          annualRate,
          years,
          12, // Monthly compounding
          monthlyContribution,
          contributionFrequency,
          interestFrequency
        );
        updateField('result', calculation);
        
        // Update URL with current parameters
        updateURL({ 
          p: principal, 
          r: annualRate, 
          y: years, 
          c: monthlyContribution, 
          cf: contributionFrequency, 
          if: interestFrequency 
        });
      } catch {
        console.error("Calculation error occurred");
      }
    }
  };

  const shareCalculation = async () => {
    const success = await copyShareableURL({ 
      p: principal, 
      r: annualRate, 
      y: years, 
      c: monthlyContribution, 
      cf: contributionFrequency, 
      if: interestFrequency 
    });
    if (success) {
      toast({
        title: "Calculation shared!",
        description: "URL copied to clipboard with current settings and results",
      });
    } else {
      toast({
        title: "Share failed",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  // Prepare chart data
  const chartData = result?.monthlyBreakdown
    .filter((_, index) => index % 12 === 11 || index === result.monthlyBreakdown.length - 1) // Show yearly data
    .map(month => ({
      year: Math.ceil(month.month / 12),
      balance: Math.round(month.balance),
      principal: Math.round(month.principal),
      interest: Math.round(month.interest)
    })) || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="CI-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Compound Interest Calculator
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Calculate investment growth with compound interest and regular contributions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sidebar Ad */}
        <div className="lg:col-span-2 flex justify-center mb-6">
          <AdSlot position="middle" id="CI-002" size="medium" />
        </div>
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Investment Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="principal">Initial Investment ($)</Label>
              <Input
                id="principal"
                type="number"
                min="0"
                step="100"
                value={principal}
                onChange={(e) => updateField('principal', Number(e.target.value) || 0)}
                data-testid="principal-input"
              />
            </div>
            
            <div>
              <Label htmlFor="rate">Annual Interest Rate (%)</Label>
              <Input
                id="rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={annualRate}
                onChange={(e) => updateField('annualRate', Number(e.target.value) || 0)}
                data-testid="rate-input"
              />
            </div>
            
            <div>
              <Label htmlFor="years">Investment Period (Years)</Label>
              <Input
                id="years"
                type="number"
                min="1"
                max="100"
                value={years}
                onChange={(e) => updateField('years', Number(e.target.value) || 1)}
                data-testid="years-input"
              />
            </div>
            
            <div>
              <Label htmlFor="contribution">
                {contributionFrequency === 'monthly' ? 'Monthly' : 'Yearly'} Contribution ($)
              </Label>
              <Input
                id="contribution"
                type="number"
                min="0"
                step="10"
                value={monthlyContribution}
                onChange={(e) => updateField('monthlyContribution', Number(e.target.value) || 0)}
                data-testid="contribution-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contribution-frequency">Contribution Frequency</Label>
                <Select value={contributionFrequency} onValueChange={(value: 'monthly' | 'yearly') => updateField('contributionFrequency', value)}>
                  <SelectTrigger data-testid="contribution-frequency-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="interest-frequency">Interest Compounding</Label>
                <Select value={interestFrequency} onValueChange={(value: 'monthly' | 'yearly') => updateField('interestFrequency', value)}>
                  <SelectTrigger data-testid="interest-frequency-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Button onClick={calculate} className="w-full" data-testid="calculate-button">
                <TrendingUp className="w-4 h-4 mr-2" />
                Calculate Investment Growth
              </Button>
              
              {result ? <Button 
                  onClick={shareCalculation} 
                  variant="outline" 
                  className="w-full" 
                  data-testid="share-calculation-button"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share Calculation
                </Button> : null}
              <Button onClick={resetFields} variant="outline" className="w-full" data-testid="reset-compound-interest-button">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Investment Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Final Amount
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="final-amount">
                      {formatCurrency(result.finalAmount)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-200 dark:border-slate-700">
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Total Contributions
                      </div>
                      <div className="text-lg font-semibold" data-testid="total-contributions">
                        {formatCurrency(result.totalContributions)}
                      </div>
                    </div>
                    
                    <div className="p-4 border border-slate-200 dark:border-slate-700">
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Interest Earned
                      </div>
                      <div className="text-lg font-semibold text-blue-600 dark:text-blue-400" data-testid="total-interest">
                        {formatCurrency(result.totalInterest)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                {result.milestones && result.milestones.length > 0 ? <div className="p-4 bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4" />
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Growth Milestones
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.milestones.map((milestone) => (
                        <Badge
                          key={milestone.multiple}
                          variant="secondary"
                          data-testid={`milestone-${milestone.multiple}x`}
                        >
                          {milestone.multiple}x at {formatMonthToYearMonth(milestone.month)}
                        </Badge>
                      ))}
                    </div>
                  </div> : null}

                {/* Growth Chart */}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Investment Growth Over Time
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="balance" stroke="#22c55e" strokeWidth={2} name="Total Balance" />
                      <Line type="monotone" dataKey="principal" stroke="#3b82f6" strokeWidth={2} name="Principal + Contributions" />
                      <Line type="monotone" dataKey="interest" stroke="#f59e0b" strokeWidth={2} name="Interest Earned" />
                    </LineChart>
                  </ResponsiveContainer>
                  

                </div>

                {/* Monthly Breakdown (Last 12 months) */}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Monthly Breakdown (Last 12 Months)
                  </h4>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {result.monthlyBreakdown.slice(-12).map((month) => (
                        <div
                          key={month.month}
                          className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-700 rounded"
                          data-testid={`month-${month.month}`}
                        >
                          <div className="font-medium">{formatMonthToYearMonth(month.month)}</div>
                          <div className="text-right text-sm">
                            <div>Balance: {formatCurrency(month.balance)}</div>
                            <div className="text-slate-600 dark:text-slate-400">
                              Interest: {formatCurrency(month.interest)}
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
                Enter your investment parameters and click "Calculate" to see your projected returns.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="CI-003" size="large" />
      </div>
    </div>
  );
}