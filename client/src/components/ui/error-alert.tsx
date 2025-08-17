import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, AlertTriangle } from "lucide-react";

interface ErrorAlertProps {
  error: string | null;
  warnings?: Array<{ message: string; line?: number }>;
  className?: string;
}

export function ErrorAlert({
  error,
  warnings = [],
  className = "mb-6",
}: ErrorAlertProps) {
  if (!error && warnings.length === 0) return null;

  if (error) {
    return (
      <Alert
        className={`border-red-200 bg-red-50 dark:bg-red-900/20 ${className}`}
      >
        <XCircle className="w-4 h-4" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (warnings.length > 0) {
    return (
      <Alert
        className={`border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 ${className}`}
      >
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          <div className="font-medium mb-2">Validation Warnings:</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {warnings.slice(0, 5).map((warning, index) => (
              <div key={index} className="text-sm">
                {warning.line ? `Line ${warning.line}: ` : ""}
                {warning.message}
              </div>
            ))}
            {warnings.length > 5 && (
              <div className="text-sm font-medium">
                +{warnings.length - 5} more warnings...
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
