import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatTypeScript } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, Minimize2, RotateCcw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { SecurityBanner } from "@/components/ui/security-banner";

const DEFAULT_TYPESCRIPT = `interface User{name:string;age:number;email?:string;isActive:boolean;}type UserStatus="active"|"inactive"|"pending";class UserManager{private users:User[]=[];constructor(initialUsers:User[]=[]){this.users=initialUsers;}addUser(user:User):void{this.users.push(user);}getActiveUsers():User[]{return this.users.filter(user=>user.isActive);}getUserByName<T extends User>(name:string):T|undefined{return this.users.find(user=>user.name===name)as T|undefined;}}const createUserGreeting=(user:User,status:UserStatus="active"):string=>{const greeting=status==="active"?"Welcome":"Hello";return \`\${greeting} \${user.name}! You are \${user.age} years old.\`;};enum Permission{READ="read",WRITE="write",DELETE="delete"}function hasPermission(userRole:string,required:Permission):boolean{const rolePermissions:{[key:string]:Permission[]}={admin:[Permission.READ,Permission.WRITE,Permission.DELETE],editor:[Permission.READ,Permission.WRITE],viewer:[Permission.READ]};return rolePermissions[userRole]?.includes(required)??false;}`;

export default function TypeScriptFormatter() {
  const [input, setInput] = useState(DEFAULT_TYPESCRIPT);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatCode = useCallback(
    async (minify = false) => {
      try {
        const { formatted, error: formatError } = await formatTypeScript(
          input,
          minify
        );
        setOutput(formatted);
        setError(formatError || null);
      } catch (error) {
        setError(
          `Formatting error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    },
    [input]
  );

  const handleInputChange = (value: string) => {
    setInput(value);
    if (output) {
      setOutput("");
    }
  };

  const handleReset = () => {
    setInput(DEFAULT_TYPESCRIPT);
    setOutput("");
    setError(null);
  };

  useEffect(() => {
    formatCode(false); // Beautify by default
  }, [formatCode]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              JavaScript/TypeScript Formatter
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Format, beautify, or minify JavaScript and TypeScript code using
              Prettier
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      {error ? (
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="mb-6 flex gap-4">
        <Button
          onClick={() => formatCode(false)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Code className="w-4 h-4 mr-2" />
          Beautify Code
        </Button>
        <Button
          onClick={() => formatCode(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Minimize2 className="w-4 h-4 mr-2" />
          Minify Code
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input JavaScript/TypeScript</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={e => handleInputChange(e.target.value)}
              placeholder="Paste your JavaScript or TypeScript code here..."
              data-testid="typescript-input"
              className="min-h-[400px] font-mono text-sm"
              rows={20}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatted Output</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly={true}
              placeholder="Formatted JavaScript/TypeScript will appear here..."
              data-testid="typescript-output"
              className="min-h-[400px] font-mono text-sm bg-slate-50 dark:bg-slate-900"
              rows={20}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-slate-700 dark:text-slate-300">
              <Code className="w-5 h-5 mr-2" />
              TypeScript Formatting Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Beautification Features:
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Type annotation formatting</li>
                  <li>• Interface and type definition styling</li>
                  <li>• Generic type parameter alignment</li>
                  <li>• Enum and namespace formatting</li>
                  <li>• Decorator and metadata styling</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                  TypeScript Benefits:
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Preserves type information</li>
                  <li>• Maintains type safety</li>
                  <li>• Consistent code style</li>
                  <li>• Improved readability</li>
                  <li>• Professional formatting standards</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
