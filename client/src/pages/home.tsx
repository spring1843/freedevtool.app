import React, { useState } from "react";
import { Link } from "wouter";
import {
  Search,
  Keyboard,
  ExternalLink,
  Play,
  Square,
  SkipForward,
  Pause,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@/hooks/use-search";
import { useDemo } from "@/providers/demo-provider";

export default function Home() {
  const { searchQuery, setSearchQuery, filteredToolsData } = useSearch();
  const [showAllShortcuts, setShowAllShortcuts] = useState(false);
  const {
    isDemoRunning,
    isDemoPaused,
    currentDemoTool,
    demoProgress,
    demoSpeed,
    startDemo,
    stopDemo,
    pauseDemo,
    resumeDemo,
    skipToNext,
    setDemoSpeed,
    totalTools,
  } = useDemo();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          FreeDevTool.App
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-2">
          🚀 Open Source • Offline Developer Tools
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
          Community-driven utilities with browser-based computation •
          Privacy-focused design
        </p>

        {/* Key Advantages */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <div className="inline-flex items-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Open Source & Community Driven
            </span>
          </div>
          <div className="inline-flex items-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Free Core Features
            </span>
          </div>
          <div className="inline-flex items-center bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
              No Network Requests Design
            </span>
          </div>
        </div>

        {/* Demo Mode */}
        {isDemoRunning ? (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Badge variant="default" className="bg-blue-600">
                  Demo Mode Active
                </Badge>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {currentDemoTool}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={isDemoPaused ? resumeDemo : pauseDemo}
                  className="flex items-center space-x-1"
                >
                  {isDemoPaused ? (
                    <Play className="w-3 h-3" />
                  ) : (
                    <Pause className="w-3 h-3" />
                  )}
                  <span>{isDemoPaused ? "Resume" : "Pause"}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={skipToNext}
                  className="flex items-center space-x-1"
                >
                  <SkipForward className="w-3 h-3" />
                  <span>Skip</span>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={stopDemo}
                  className="flex items-center space-x-1"
                >
                  <Square className="w-3 h-3" />
                  <span>Stop</span>
                </Button>
              </div>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${demoProgress}%` }}
              />
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 text-center">
              {Math.round(demoProgress)}% complete •{" "}
              {isDemoPaused ? "Paused" : `${demoSpeed.replace("-", " ")} speed`}
            </div>
          </div>
        ) : null}

        {/* Demo Button */}
        {!isDemoRunning && (
          <div className="mb-6">
            <div className="flex flex-col items-center space-y-3">
              <Button
                onClick={startDemo}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                data-testid="start-demo-button"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Demo Tour ({totalTools} tools)
              </Button>

              {/* Speed Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Speed:
                </span>
                {(["slow", "normal", "fast", "very-fast"] as const).map(
                  speed => (
                    <Button
                      key={speed}
                      size="sm"
                      variant={demoSpeed === speed ? "default" : "outline"}
                      onClick={() => setDemoSpeed(speed)}
                      className="h-6 px-2 text-xs"
                    >
                      {speed === "very-fast"
                        ? "Very Fast"
                        : speed.charAt(0).toUpperCase() + speed.slice(1)}
                    </Button>
                  )
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Watch all {totalTools} tools in action automatically • Pause
                anytime to interact
              </p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search in 45 tools... (Ctrl+S)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="homepage-search-input"
          />
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle
              className="flex items-center justify-between cursor-pointer hover:text-primary transition-colors"
              onClick={() => setShowAllShortcuts(!showAllShortcuts)}
            >
              <div className="flex items-center">
                <Keyboard className="w-5 h-5 mr-2" />
                Keyboard Shortcuts
              </div>
              {showAllShortcuts ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Use keyboard shortcuts to quickly navigate and control the app.
            </p>

            {/* Always visible - Essential shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Navigation:</h4>
                <ul className="text-sm space-y-1">
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Ctrl+M
                    </code>{" "}
                    - Open/Close Menu
                  </li>
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Ctrl+S
                    </code>{" "}
                    - Focus Search
                  </li>
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Escape
                    </code>{" "}
                    - Close Menu
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Theme & UI:</h4>
                <ul className="text-sm space-y-1">
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Ctrl+D
                    </code>{" "}
                    - Toggle Theme
                  </li>
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      ↑/↓
                    </code>{" "}
                    - Search Navigation
                  </li>
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Enter
                    </code>{" "}
                    - Select Tool
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Popular Tools:</h4>
                <ul className="text-sm space-y-1">
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Ctrl+J
                    </code>{" "}
                    - JSON Formatter
                  </li>
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Ctrl+B
                    </code>{" "}
                    - Base64 Encoder
                  </li>
                  <li>
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                      Ctrl+Q
                    </code>{" "}
                    - QR Generator
                  </li>
                </ul>
              </div>
            </div>

            {/* Expandable section with all shortcuts */}
            {showAllShortcuts ? (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Converters:</h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                          Ctrl+J
                        </code>{" "}
                        - JSON ↔ YAML
                      </li>
                      <li>
                        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                          Ctrl+B
                        </code>{" "}
                        - Base64 Encoder
                      </li>
                      <li>
                        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                          Ctrl+U
                        </code>{" "}
                        - URL Encoder
                      </li>
                      <li>
                        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                          Ctrl+H
                        </code>{" "}
                        - HTML Encoder
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Text Tools:</h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                          Ctrl+W
                        </code>{" "}
                        - Word Counter
                      </li>
                      <li>
                        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                          Ctrl+E
                        </code>{" "}
                        - Regex Tester
                      </li>
                      <li>
                        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                          Ctrl+T
                        </code>{" "}
                        - Text Diff
                      </li>
                      <li>
                        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                          Ctrl+F
                        </code>{" "}
                        - Text Formatter
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Generators:</h4>
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
                          Ctrl+G
                        </code>{" "}
                        - GUID Generator
                      </li>
                      <li>
                        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                          Ctrl+C
                        </code>{" "}
                        - Color Palette
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">
                      Hardware Tests:
                    </h4>
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
                      <li>
                        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">
                          Ctrl+Shift+S
                        </code>{" "}
                        - Speaker Test
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="text-center mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllShortcuts(!showAllShortcuts)}
                className="text-primary hover:text-primary/80"
              >
                {showAllShortcuts ? "Show Less" : "Show All Shortcuts"}
              </Button>
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
                        <div className="flex items-center gap-2">
                          <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {tool.name}
                          </span>
                          {tool.experimental ? (
                            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded font-medium">
                              EXPERIMENTAL
                            </span>
                          ) : null}
                        </div>
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
            No tools found matching "{searchQuery}"
          </p>
        </div>
      )}

      {/* Key Advantages Section */}
      <div className="mt-16">
        {/* Why Choose Us - Prominent Section */}
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 mb-8">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-slate-900 dark:text-slate-100 mb-2">
              Why FreeDevTool.App is Different
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-400">
              Built by developers, for developers. Designed with privacy,
              security, and transparency as core values.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🌟</span>
                </div>
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                  Open Source
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Community-driven development with transparent code. You can
                  audit, contribute, and trust every line of code.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">💰</span>
                </div>
                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                  Free Core Features
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Current tools are free since computation happens in your
                  browser for enhanced security.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🔒</span>
                </div>
                <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">
                  Zero Data Transmission
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your data stays in your browser. All processing happens
                  locally for enhanced security.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">✈️</span>
                </div>
                <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
                  Offline Design
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Built to function without internet connectivity. Designed for
                  environments where network access is limited or restricted.
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Ready to use right now • No signup required • Privacy-focused
                  design
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <div
          id="security"
          className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center">
            Technical Design Principles
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-green-700 dark:text-green-400 mb-2">
                Content Security Policy
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Implemented with CSP headers designed to block external
                connections and prevent unintended data transmission.
              </p>
            </div>
            <div className="text-center">
              <div className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                Local Processing Design
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Built to handle all computations in your browser using
                JavaScript, avoiding server-side processing.
              </p>
            </div>
            <div className="text-center">
              <div className="font-medium text-purple-700 dark:text-purple-400 mb-2">
                No External Dependencies
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Designed with minimal external dependencies to reduce potential
                network requests and data sharing.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          <p className="font-medium">
            FreeDevTool.App - Open Source Developer Tools with Browser-Based
            Computation
          </p>
          <p className="mt-1">
            Built with a design philosophy focused on browser-based computation
            and minimal network requirements
          </p>
        </div>
      </div>
    </div>
  );
}
