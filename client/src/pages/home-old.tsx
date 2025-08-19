import React from "react";
import { Link } from "wouter";
import { Search, Keyboard, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearch } from "@/hooks/use-search";

export default function Home() {
  const { searchQuery, setSearchQuery, filteredToolsData } = useSearch();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          FreeDevTool.App
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
          🔒 100% Secure Offline Developer Tools
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
          Enterprise-safe utilities that work completely offline • No data
          transmission • Perfect for sensitive business information
        </p>

        {/* Security Badge */}
        <div className="inline-flex items-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2 mb-6">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            Zero Internet Connectivity Required - Your Data Never Leaves Your
            Device
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search tools..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Keyboard className="w-5 h-5 mr-2" />
              Keyboard Shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Use keyboard shortcuts to quickly navigate to any tool. Press the
              combination while any tool page is open.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Popular Shortcuts:
                </h4>
                <ul className="text-sm space-y-1">
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Ctrl+J
                    </code>{" "}
                    - JSON ↔ YAML
                  </li>
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Ctrl+D
                    </code>{" "}
                    - Date Converter
                  </li>
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Ctrl+B
                    </code>{" "}
                    - Base64 Encoder
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Text Tools:</h4>
                <ul className="text-sm space-y-1">
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Ctrl+Q
                    </code>{" "}
                    - QR Generator
                  </li>
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Ctrl+P
                    </code>{" "}
                    - Password Generator
                  </li>
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Ctrl+W
                    </code>{" "}
                    - Word Counter
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Hardware:</h4>
                <ul className="text-sm space-y-1">
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Ctrl+Shift+V
                    </code>{" "}
                    - Camera Test
                  </li>
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Ctrl+Shift+M
                    </code>{" "}
                    - Microphone Test
                  </li>
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Ctrl+Shift+K
                    </code>{" "}
                    - Keyboard Test
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tools Grid */}
      <div className="space-y-8">
        {Object.entries(filteredToolsData).map(([section, data]) => (
          <div key={section}>
            <div className="flex items-center mb-4">
              <div className={`w-3 h-3 rounded-full ${data.color} mr-3`} />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {section}
              </h2>
              <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                ({data.tools.length} tool{data.tools.length !== 1 ? "s" : ""})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.tools.map(tool => (
                <Link key={tool.path} href={tool.path}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group border-l-4 border-l-transparent hover:border-l-slate-400">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {tool.name}
                        </span>
                        <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {tool.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">
                          {tool.shortcut}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {Object.keys(filteredToolsData).length === 0 && searchQuery.trim() && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            No tools found matching &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {/* Enhanced Security Footer */}
      <div className="mt-16">
        {/* Security Features */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center">
            🛡️ Why Choose Our Offline Tools for Professional Work?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-green-700 dark:text-green-400 mb-2">
                🔒 Zero Data Leakage
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                No network requests, no tracking, no external dependencies.
                Perfect for handling confidential business data, API keys, and
                sensitive code.
              </p>
            </div>
            <div className="text-center">
              <div className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                ⚡ Works Offline
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Complete functionality without internet connectivity. Ideal for
                secure environments, air-gapped systems, and locations with
                restricted access.
              </p>
            </div>
            <div className="text-center">
              <div className="font-medium text-purple-700 dark:text-purple-400 mb-2">
                🏢 Enterprise Ready
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Content Security Policy enforced, no external resources loaded,
                fully compliant with corporate security requirements and data
                policies.
              </p>
            </div>
          </div>
        </div>

        {/* Standard Footer */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          <p>
            FreeDevTool.App - Professional-grade offline developer utilities
          </p>
          <p className="mt-1">
            All processing happens locally in your browser • Content Security
            Policy enforced • No external connections
          </p>
        </div>
      </div>
    </div>
  );
}
