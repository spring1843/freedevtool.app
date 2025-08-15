import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TextEditorWithLines } from "@/components/ui/text-editor-with-lines";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Copy, RefreshCw, Hash, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePersistentForm } from "@/hooks/use-persistent-state";
import { useToolDefault } from "@/hooks/use-tool-default";
import AdSlot from "@/components/ui/ad-slot";

// Lorem Ipsum content
const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
  'accusamus', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
  'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis',
  'et', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'sunt', 'explicabo',
  'nemo', 'ipsam', 'voluptatem', 'quia', 'voluptas', 'aspernatur', 'aut',
  'odit', 'fugit', 'sed', 'quia', 'consequuntur', 'magni', 'dolores', 'ratione',
  'sequi', 'nesciunt', 'neque', 'porro', 'quisquam', 'est', 'qui', 'dolorem',
  'adipisci', 'velit', 'sed', 'quia', 'non', 'numquam', 'eius', 'modi', 'tempora',
  'incidunt', 'ut', 'labore', 'et', 'dolore', 'magnam', 'aliquam', 'quaerat'
];

const LOREM_SENTENCES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  'Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.',
  'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.',
  'Ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
  'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.',
  'Et harum quidem rerum facilis est et expedita distinctio nam libero tempore cum soluta nobis est eligendi optio.',
  'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae.',
  'Itaque earum rerum hic tenetur a sapiente delectus ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis.',
  'Nam libero tempore cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat.',
  'Facere possimus omnis voluptas assumenda est omnis dolor repellendus et aut officiis debitis aut rerum necessitatibus.'
];

type GenerationType = 'words' | 'sentences' | 'paragraphs';

export default function LoremGenerator() {
  const { fields, updateField, resetFields } = usePersistentForm('lorem-generator', {
    generationType: 'paragraphs' as GenerationType,
    count: 3,
    startWithLorem: true,
    generatedText: "",
    characterCount: 0,
    wordCount: 0
  });

  const { generationType, count, startWithLorem, generatedText, characterCount, wordCount } = fields;
  
  const { toast } = useToast();

  // Generate random words
  const generateWords = (wordCount: number, startWithLorem: boolean): string => {
    const words: string[] = [];
    
    if (startWithLorem && wordCount > 0) {
      words.push('Lorem');
      if (wordCount > 1) words.push('ipsum');
      if (wordCount > 2) words.push('dolor');
      if (wordCount > 3) words.push('sit');
      if (wordCount > 4) words.push('amet');
    }
    
    while (words.length < wordCount) {
      const randomWord = LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
      words.push(randomWord);
    }
    
    return words.join(' ');
  };

  // Generate random sentences
  const generateSentences = (sentenceCount: number, startWithLorem: boolean): string => {
    const sentences: string[] = [];
    
    if (startWithLorem && sentenceCount > 0) {
      sentences.push(LOREM_SENTENCES[0]);
    }
    
    while (sentences.length < sentenceCount) {
      const randomSentence = LOREM_SENTENCES[Math.floor(Math.random() * LOREM_SENTENCES.length)];
      if (!sentences.includes(randomSentence)) {
        sentences.push(randomSentence);
      } else if (sentences.length < sentenceCount) {
        // If we've used all unique sentences, start generating variations
        const baseWords = randomSentence.split(' ');
        const variation = baseWords.map(word => {
          if (Math.random() > 0.8 && LOREM_WORDS.includes(word.toLowerCase().replace(/[.,]/g, ''))) {
            return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
          }
          return word;
        }).join(' ');
        sentences.push(variation);
      }
    }
    
    return sentences.join(' ');
  };

  // Generate paragraphs
  const generateParagraphs = (paragraphCount: number, startWithLorem: boolean): string => {
    const paragraphs: string[] = [];
    
    for (let i = 0; i < paragraphCount; i++) {
      const sentenceCount = Math.floor(Math.random() * 4) + 3; // 3-6 sentences per paragraph
      const shouldStartWithLorem = startWithLorem && i === 0;
      const paragraph = generateSentences(sentenceCount, shouldStartWithLorem);
      paragraphs.push(paragraph);
    }
    
    return paragraphs.join('\n\n');
  };

  // Generate Lorem Ipsum text
  const generateText = () => {
    let text = '';
    
    switch (generationType) {
      case 'words':
        text = generateWords(count, startWithLorem);
        break;
      case 'sentences':
        text = generateSentences(count, startWithLorem);
        break;
      case 'paragraphs':
        text = generateParagraphs(count, startWithLorem);
        break;
    }
    
    updateField('generatedText', text);
    updateField('characterCount', text.length);
    updateField('wordCount', text.split(/\s+/).filter(word => word.length > 0).length);
    
    toast({
      title: "Text Generated",
      description: `Generated ${count} ${generationType} successfully.`,
    });
  };

  // Auto-generate lorem ipsum on initial load
  useEffect(() => {
    if (!generatedText) {
      generateText();
    }
  }, [generatedText]);

  // Generate Lorem Ipsum with default settings on component mount
  useToolDefault(() => {
    generateText();
  });

  // Copy to clipboard
  const copyToClipboard = async () => {
    if (!generatedText) return;
    
    try {
      await navigator.clipboard.writeText(generatedText);
      toast({
        title: "Copied to Clipboard",
        description: "Lorem ipsum text has been copied.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Failed to copy text to clipboard.",
        variant: "destructive"
      });
    }
  };

  // Quick preset buttons
  const quickPresets = [
    { type: 'paragraphs' as GenerationType, count: 1, label: '1 Paragraph' },
    { type: 'paragraphs' as GenerationType, count: 3, label: '3 Paragraphs' },
    { type: 'paragraphs' as GenerationType, count: 5, label: '5 Paragraphs' },
    { type: 'sentences' as GenerationType, count: 5, label: '5 Sentences' },
    { type: 'sentences' as GenerationType, count: 10, label: '10 Sentences' },
    { type: 'words' as GenerationType, count: 25, label: '25 Words' },
    { type: 'words' as GenerationType, count: 50, label: '50 Words' },
    { type: 'words' as GenerationType, count: 100, label: '100 Words' }
  ];

  const usePreset = (preset: typeof quickPresets[0]) => {
    updateField('generationType', preset.type);
    updateField('count', preset.count);
    // Auto-generate with preset
    setTimeout(() => {
      let text = '';
      switch (preset.type) {
        case 'words':
          text = generateWords(preset.count, startWithLorem);
          break;
        case 'sentences':
          text = generateSentences(preset.count, startWithLorem);
          break;
        case 'paragraphs':
          text = generateParagraphs(preset.count, startWithLorem);
          break;
      }
      updateField('generatedText', text);
      updateField('characterCount', text.length);
      updateField('wordCount', text.split(/\s+/).filter(word => word.length > 0).length);
    }, 100);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="LI-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Lorem Ipsum Generator
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Generate placeholder text for your designs, layouts, and content mockups
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="generation-type">Generate</Label>
                <Select value={generationType} onValueChange={(value: GenerationType) => updateField('generationType', value)}>
                  <SelectTrigger data-testid="generation-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paragraphs">Paragraphs</SelectItem>
                    <SelectItem value="sentences">Sentences</SelectItem>
                    <SelectItem value="words">Words</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="count">Count</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="50"
                  value={count}
                  onChange={(e) => updateField('count', parseInt(e.target.value, 10) || 1)}
                  data-testid="count-input"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="start-with-lorem"
                  type="checkbox"
                  checked={startWithLorem}
                  onChange={(e) => updateField('startWithLorem', e.target.checked)}
                  className="w-4 h-4"
                  data-testid="start-lorem-checkbox"
                />
                <Label htmlFor="start-with-lorem" className="text-sm">
                  Start with "Lorem ipsum..."
                </Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={generateText} className="flex-1" data-testid="generate-text">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Text
                </Button>
                <Button onClick={resetFields} variant="outline" data-testid="reset-lorem-button">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {generatedText ? <Button onClick={copyToClipboard} variant="outline" className="w-full" data-testid="copy-text">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button> : null}

              {generatedText ? <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Characters:</span>
                    <span className="font-mono">{characterCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span className="font-mono">{wordCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span>{count} {generationType}</span>
                  </div>
                </div> : null}
            </CardContent>
          </Card>

          {/* Quick Presets */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {quickPresets.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => usePreset(preset)}
                    className="text-xs"
                    data-testid={`preset-${index}`}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Text Display */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Generated Text
                {generatedText ? <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Hash className="w-4 h-4" />
                    {wordCount} words, {characterCount} chars
                  </div> : null}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedText ? (
                <TextEditorWithLines
                  value={generatedText}
                  onChange={() => {}}
                  disabled={true}
                  className="min-h-[400px] font-serif leading-relaxed"
                  data-testid="generated-text-display"
                />
              ) : (
                <div className="min-h-[400px] flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No Text Generated</p>
                    <p className="text-sm">Click "Generate Text" or use a preset to create Lorem ipsum text</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Middle Ad */}
      <div className="flex justify-center my-8">
        <AdSlot position="middle" id="LI-002" size="medium" />
      </div>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Lorem Ipsum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">What is Lorem Ipsum?</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Standard dummy text used in printing and typesetting</li>
                <li>• Derived from a Latin text by Cicero from 45 BC</li>
                <li>• Industry standard since the 1500s</li>
                <li>• Used to focus on design rather than content</li>
                <li>• Approximates natural distribution of letters</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Usage Tips:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Perfect for mockups and prototypes</li>
                <li>• Use paragraphs for page layouts</li>
                <li>• Use sentences for shorter content blocks</li>
                <li>• Use words for headlines and labels</li>
                <li>• Always replace with real content before launch</li>
              </ul>
            </div>
          </div>
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Pro Tip:</strong> Lorem ipsum helps prevent content from distracting during the design process. 
              It maintains focus on layout, typography, and visual hierarchy rather than readable content.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="LI-003" size="large" />
      </div>
    </div>
  );
}