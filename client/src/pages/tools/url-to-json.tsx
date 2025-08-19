import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";
import { Link, Globe, Hash, Share } from "lucide-react";
import {
  updateURL,
  copyShareableURL,
  getValidatedParam,
} from "@/lib/url-sharing";
import { useToast } from "@/hooks/use-toast";

interface URLComponents {
  protocol?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  origin?: string;
  tld?: string;
  subdomain?: string;
  domain?: string;
  queryParams?: Record<string, string>;
}

export default function URLToJSON() {
  const [inputUrl, setInputUrl] = useState(
    "https://example.com/path?param1=value1&param2=value2#section"
  );
  const [urlComponents, setUrlComponents] = useState<URLComponents>({});
  const [jsonOutput, setJsonOutput] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load parameters from URL with validation
    const urlInput = getValidatedParam(
      "url",
      "https://example.com/path?param1=value1&param2=value2#section",
      {
        type: "string",
        pattern: /^https?:\/\/[^\s<>"{}|\\^`[\]]*$/,
        maxLength: 2048, // Standard max URL length
      }
    );
    setInputUrl(urlInput as string);
  }, []);

  useEffect(() => {
    parseURL();
    // Update URL when input changes
    updateURL({ url: inputUrl });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputUrl]);

  const extractTLD = (
    hostname: string
  ): { tld: string; domain: string; subdomain: string } => {
    const parts = hostname.split(".");
    if (parts.length < 2) {
      return { tld: "", domain: hostname, subdomain: "" };
    }

    // Common TLDs and their patterns
    const commonTLDs = [
      "com",
      "org",
      "net",
      "edu",
      "gov",
      "mil",
      "int",
      "co.uk",
      "co.jp",
      "co.au",
      "co.nz",
      "co.za",
      "com.au",
      "com.br",
      "com.cn",
      "com.mx",
      "com.sg",
      "org.uk",
      "net.au",
      "edu.au",
      "gov.au",
    ];

    let tld = "";
    let domain = "";
    let subdomain = "";

    // Check for multi-part TLDs first
    for (const multiTLD of commonTLDs.filter(t => t.includes("."))) {
      if (hostname.endsWith(`.${multiTLD}`)) {
        tld = multiTLD;
        const remaining = hostname.slice(0, -(multiTLD.length + 1));
        const remainingParts = remaining.split(".");
        domain = remainingParts[remainingParts.length - 1];
        subdomain = remainingParts.slice(0, -1).join(".");
        return { tld, domain, subdomain };
      }
    }

    // Single-part TLD
    tld = parts[parts.length - 1];
    domain = parts[parts.length - 2];
    subdomain = parts.slice(0, -2).join(".");

    return { tld, domain, subdomain };
  };

  const parseURL = () => {
    try {
      setError("");

      if (!inputUrl.trim()) {
        setUrlComponents({});
        setJsonOutput("");
        return;
      }

      let urlToParse = inputUrl.trim();

      // Add protocol if missing
      if (!urlToParse.match(/^https?:\/\//)) {
        urlToParse = `https://${urlToParse}`;
      }

      const url = new URL(urlToParse);
      const { tld, domain, subdomain } = extractTLD(url.hostname);

      // Parse query parameters
      const queryParams: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });

      const components: URLComponents = {
        protocol: url.protocol.slice(0, -1), // Remove trailing ':'
        hostname: url.hostname,
        port: url.port || undefined,
        pathname: url.pathname,
        search: url.search || undefined,
        hash: url.hash || undefined,
        origin: url.origin,
        tld: tld || undefined,
        domain: domain || undefined,
        subdomain: subdomain || undefined,
        queryParams:
          Object.keys(queryParams).length > 0 ? queryParams : undefined,
      };

      // Remove undefined values for cleaner JSON
      const cleanComponents = Object.fromEntries(
        Object.entries(components).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );

      setUrlComponents(cleanComponents);
      setJsonOutput(JSON.stringify(cleanComponents, null, 2));
    } catch {
      setError("Invalid URL format");
      setUrlComponents({});
      setJsonOutput("");
    }
  };

  const shareConverter = async () => {
    const success = await copyShareableURL({ url: inputUrl });
    if (success) {
      toast({
        title: "URL to JSON converter shared!",
        description: "URL copied to clipboard with current input",
      });
    } else {
      toast({
        title: "Share failed",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const clearInput = () => {
    setInputUrl("");
    setUrlComponents({});
    setJsonOutput("");
    setError("");
  };

  const loadExample = () => {
    setInputUrl(
      "https://api.example.com:8080/v1/users/123?include=profile,settings&format=json&sort=name#results"
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          URL to JSON Converter
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Break down URLs into their components including protocol, hostname,
          TLD, and query parameters
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Link className="w-5 h-5 mr-2" />
                URL Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="url-input">Enter URL</Label>
                <Textarea
                  id="url-input"
                  value={inputUrl}
                  onChange={e => setInputUrl(e.target.value)}
                  placeholder="https://example.com/path?param1=value1&param2=value2#section"
                  className="font-mono min-h-[100px] resize-none"
                  data-testid="url-input"
                />
              </div>

              {error ? (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              ) : null}

              <div className="flex gap-2">
                <Button
                  onClick={parseURL}
                  className="flex-1"
                  data-testid="parse-button"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Parse URL
                </Button>

                <Button
                  onClick={shareConverter}
                  variant="outline"
                  data-testid="share-converter-button"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={loadExample}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  data-testid="load-example-button"
                >
                  Load Example
                </Button>

                <Button
                  onClick={clearInput}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  data-testid="clear-button"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Hash className="w-5 h-5 mr-2" />
                  JSON Output
                </CardTitle>
                {jsonOutput ? (
                  <CopyButton text={jsonOutput} variant="outline" size="sm" />
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              {jsonOutput ? (
                <div className="space-y-4">
                  <Textarea
                    value={jsonOutput}
                    readOnly={true}
                    className="font-mono text-sm min-h-[300px] resize-none"
                    placeholder="JSON output will appear here..."
                  />

                  {/* URL Components Summary */}
                  <div className="grid grid-cols-1 gap-3">
                    {urlComponents.protocol ? (
                      <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                          Protocol:
                        </span>
                        <span className="text-sm font-mono text-blue-900 dark:text-blue-100">
                          {urlComponents.protocol}
                        </span>
                      </div>
                    ) : null}

                    {urlComponents.hostname ? (
                      <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          Hostname:
                        </span>
                        <span className="text-sm font-mono text-green-900 dark:text-green-100">
                          {urlComponents.hostname}
                        </span>
                      </div>
                    ) : null}

                    {urlComponents.tld ? (
                      <div className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                          TLD:
                        </span>
                        <span className="text-sm font-mono text-purple-900 dark:text-purple-100">
                          {urlComponents.tld}
                        </span>
                      </div>
                    ) : null}

                    {urlComponents.queryParams &&
                    Object.keys(urlComponents.queryParams).length > 0 ? (
                      <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-400 block mb-2">
                          Query Parameters (
                          {Object.keys(urlComponents.queryParams).length}):
                        </span>
                        <div className="space-y-1">
                          {Object.entries(urlComponents.queryParams).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between items-center"
                              >
                                <span className="text-sm font-mono text-orange-800 dark:text-orange-200">
                                  {key}:
                                </span>
                                <span className="text-sm font-mono text-orange-900 dark:text-orange-100">
                                  {value}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter a URL above to see its JSON breakdown</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-center my-8" />

      {/* Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About URL to JSON Converter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Extracted Components:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>
                  • <strong>Protocol:</strong> HTTP, HTTPS, FTP, etc.
                </li>
                <li>
                  • <strong>Hostname:</strong> Full domain name
                </li>
                <li>
                  • <strong>TLD:</strong> Top-level domain (.com, .org, etc.)
                </li>
                <li>
                  • <strong>Domain:</strong> Main domain name
                </li>
                <li>
                  • <strong>Subdomain:</strong> www, api, etc.
                </li>
                <li>
                  • <strong>Port:</strong> Custom port numbers
                </li>
                <li>
                  • <strong>Path:</strong> URL path segments
                </li>
                <li>
                  • <strong>Query Parameters:</strong> Individual URL parameters
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Use Cases:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• API development and testing</li>
                <li>• URL analysis and debugging</li>
                <li>• Web scraping and automation</li>
                <li>• SEO and analytics tools</li>
                <li>• Documentation and training</li>
                <li>• Link validation and parsing</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h4 className="font-semibold mb-2">Example URLs to try:</h4>
            <div className="space-y-2 text-sm">
              <code className="block p-2 bg-slate-100 dark:bg-slate-800 rounded">
                https://api.github.com/repos/owner/repo?per_page=100&sort=updated#readme
              </code>
              <code className="block p-2 bg-slate-100 dark:bg-slate-800 rounded">
                https://shop.example.co.uk:8080/products/electronics?category=laptops&brand=apple&sort=price
              </code>
              <code className="block p-2 bg-slate-100 dark:bg-slate-800 rounded">
                ftp://files.example.com/downloads/software/installer.exe
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-8" />
    </div>
  );
}
