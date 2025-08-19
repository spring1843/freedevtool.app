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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Copy, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { SecurityBanner } from "@/components/ui/security-banner";

const loremWords = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
  "at",
  "vero",
  "eos",
  "accusamus",
  "accusantium",
  "doloremque",
  "laudantium",
  "totam",
  "rem",
  "aperiam",
  "eaque",
  "ipsa",
  "quae",
  "ab",
  "illo",
  "inventore",
  "veritatis",
];

export default function LoremGenerator() {
  const [type, setType] = useState<"words" | "sentences" | "paragraphs">(
    "paragraphs"
  );
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [generated, setGenerated] = useState("");

  const generateRandom = () => {
    const randomIndex = Math.floor(Math.random() * loremWords.length);
    return loremWords[randomIndex];
  };

  const generateSentence = (wordCount = 10): string => {
    const words: string[] = [];

    for (let i = 0; i < wordCount; i++) {
      words.push(generateRandom());
    }

    // Capitalize first word
    if (words.length > 0) {
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    }

    return `${words.join(" ")}.`;
  };

  const generateParagraph = (sentenceCount = 5): string => {
    const sentences: string[] = [];

    for (let i = 0; i < sentenceCount; i++) {
      const wordCount = Math.floor(Math.random() * 8) + 6; // 6-13 words per sentence
      sentences.push(generateSentence(wordCount));
    }

    return sentences.join(" ");
  };

  const generateLorem = () => {
    let result = "";

    switch (type) {
      case "words": {
        const words: string[] = [];

        if (startWithLorem && count > 0) {
          words.push("Lorem");
          for (let i = 1; i < count; i++) {
            words.push(generateRandom());
          }
        } else {
          for (let i = 0; i < count; i++) {
            words.push(generateRandom());
          }
        }

        result = words.join(" ");
        break;
      }

      case "sentences": {
        const sentences: string[] = [];

        for (let i = 0; i < count; i++) {
          const wordCount = Math.floor(Math.random() * 8) + 6;
          let sentence = generateSentence(wordCount);

          // Start first sentence with "Lorem ipsum" if requested
          if (i === 0 && startWithLorem) {
            sentence = `Lorem ipsum ${sentence.toLowerCase()}`;
            sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
          }

          sentences.push(sentence);
        }

        result = sentences.join(" ");
        break;
      }

      case "paragraphs": {
        const paragraphs: string[] = [];

        for (let i = 0; i < count; i++) {
          const sentenceCount = Math.floor(Math.random() * 4) + 3; // 3-6 sentences per paragraph
          let paragraph = generateParagraph(sentenceCount);

          // Start first paragraph with "Lorem ipsum" if requested
          if (i === 0 && startWithLorem) {
            paragraph = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. ${paragraph}`;
          }

          paragraphs.push(paragraph);
        }

        result = paragraphs.join("\n\n");
        break;
      }
      default: {
        // Handle default case
      }
    }

    setGenerated(result);
  };

  const handleReset = () => {
    setType("paragraphs");
    setCount(3);
    setStartWithLorem(true);
    setGenerated("");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generated);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  useEffect(() => {
    generateLorem();
  }, [generateLorem]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Lorem Ipsum Generator
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Generate placeholder text for design and development
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generation Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="type">Generate</Label>
              <Select
                value={type}
                onValueChange={(value: typeof type) => setType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="words">Words</SelectItem>
                  <SelectItem value="sentences">Sentences</SelectItem>
                  <SelectItem value="paragraphs">Paragraphs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="count">Count</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={e =>
                  setCount(
                    Math.max(1, Math.min(100, parseInt(e.target.value) || 1))
                  )
                }
                data-testid="count-input"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="start-with-lorem"
                checked={startWithLorem}
                onChange={e => setStartWithLorem(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="start-with-lorem">Start with "Lorem ipsum"</Label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Button
                onClick={generateLorem}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Lorem
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
            <Badge variant="outline">
              {count} {type}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {generated ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Lorem Ipsum
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generated}
              readOnly={true}
              placeholder="Generated lorem ipsum will appear here..."
              data-testid="lorem-output"
              className="min-h-[300px] font-mono text-sm bg-slate-50 dark:bg-slate-900"
              rows={15}
              showLineNumbers={true}
              showStats={true}
            />

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {generated.split(" ").length} words,{" "}
              {generated.split(/[.!?]+/).length - 1} sentences
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          About Lorem Ipsum:
        </h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <div>• Industry standard placeholder text since the 1500s</div>
          <div>• Based on a work by Cicero from 45 BC</div>
          <div>• Scrambled Latin text that's readable but meaningless</div>
          <div>
            • Perfect for focusing on design without content distraction
          </div>
        </div>
      </div>
    </div>
  );
}
