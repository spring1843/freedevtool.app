import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeEditor } from "@/components/ui/code-editor";

interface DualEditorProps {
  leftTitle: string;
  rightTitle: string;
  leftValue: string;
  rightValue: string;
  onLeftChange?: (value: string) => void;
  onRightChange?: (value: string) => void;
  leftPlaceholder?: string;
  rightPlaceholder?: string;
  leftLanguage?: string;
  rightLanguage?: string;
  rightReadOnly?: boolean;
  className?: string;
}

export function DualEditor({
  leftTitle,
  rightTitle,
  leftValue,
  rightValue,
  onLeftChange,
  onRightChange,
  leftPlaceholder = "Enter text here...",
  rightPlaceholder = "Output will appear here...",
  leftLanguage = "text",
  rightLanguage = "text",
  rightReadOnly = true,
  className = "grid grid-cols-1 lg:grid-cols-2 gap-6",
}: DualEditorProps) {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>{leftTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeEditor
            value={leftValue}
            onChange={onLeftChange}
            placeholder={leftPlaceholder}
            language={leftLanguage}
            className="min-h-[400px]"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{rightTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeEditor
            value={rightValue}
            onChange={onRightChange}
            readOnly={rightReadOnly}
            placeholder={rightPlaceholder}
            language={rightLanguage}
            className="min-h-[400px]"
          />
        </CardContent>
      </Card>
    </div>
  );
}
