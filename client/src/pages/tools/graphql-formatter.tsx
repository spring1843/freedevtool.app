import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatGraphQL } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, RotateCcw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { SecurityBanner } from "@/components/ui/security-banner";

const DEFAULT_GRAPHQL = `type User{id:ID!name:String!email:String!age:Int posts:[Post!]!profile:UserProfile}type Post{id:ID!title:String!content:String!author:User!tags:[String!]!createdAt:String!updatedAt:String comments:[Comment!]!}type Comment{id:ID!content:String!author:User!post:Post!createdAt:String!}type UserProfile{bio:String avatar:String website:String location:String}input CreateUserInput{name:String!email:String!age:Int}input UpdateUserInput{name:String email:String age:Int}type Query{users:[User!]!user(id:ID!):User posts:[Post!]!post(id:ID!):Post searchPosts(query:String!):[Post!]!}type Mutation{createUser(input:CreateUserInput!):User!updateUser(id:ID!,input:UpdateUserInput!):User!deleteUser(id:ID!):Boolean!createPost(title:String!,content:String!,authorId:ID!):Post!}type Subscription{postAdded:Post!commentAdded(postId:ID!):Comment!}schema{query:Query mutation:Mutation subscription:Subscription}`;

export default function GraphQLFormatter() {
  const [input, setInput] = useState(DEFAULT_GRAPHQL);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatCode = useCallback(async () => {
    try {
      const { formatted, error: formatError } = await formatGraphQL(input);
      setOutput(formatted);
      setError(formatError || null);
    } catch (error) {
      setError(
        `Formatting error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }, [input]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (output) {
      setOutput("");
    }
  };

  const handleReset = () => {
    setInput(DEFAULT_GRAPHQL);
    setOutput("");
    setError(null);
  };

  useEffect(() => {
    document.title = "GraphQL Formatter - FreeDevTool.App";
    formatCode();
  }, [formatCode]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              GraphQL Formatter
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Format and beautify GraphQL schemas, queries, and mutations using
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
          onClick={formatCode}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Code className="w-4 h-4 mr-2" />
          Format GraphQL
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input GraphQL</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={e => handleInputChange(e.target.value)}
              placeholder="Paste your GraphQL schema, query, or mutation here..."
              data-testid="graphql-input"
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
              placeholder="Formatted GraphQL will appear here..."
              data-testid="graphql-output"
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
              GraphQL Formatting Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Supported GraphQL Elements:
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Type definitions and interfaces</li>
                  <li>• Queries, mutations, and subscriptions</li>
                  <li>• Input types and enums</li>
                  <li>• Schema definitions</li>
                  <li>• Directive declarations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Formatting Benefits:
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Consistent field alignment</li>
                  <li>• Proper indentation for nested types</li>
                  <li>• Clean argument formatting</li>
                  <li>• Readable schema structure</li>
                  <li>• Industry-standard formatting</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
