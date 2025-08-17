import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
// import { ThemeProvider } from "@/providers/theme-provider";
import { DemoProvider } from "@/providers/demo-provider";
import { Layout } from "@/components/layout/Layout";

// Import core pages immediately
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

// Lazy import tool pages to reduce initial bundle size
const DateConverter = lazy(() => import("@/pages/tools/date-converter"));
const JsonYamlConverter = lazy(() => import("@/pages/tools/json-yaml-converter"));
const TimezoneConverter = lazy(() => import("@/pages/tools/timezone-converter"));
const UnitConverter = lazy(() => import("@/pages/tools/unit-converter"));
const JsonFormatter = lazy(() => import("@/pages/tools/json-formatter"));
const HtmlFormatter = lazy(() => import("@/pages/tools/html-formatter"));
const YamlFormatter = lazy(() => import("@/pages/tools/yaml-formatter"));
const MarkdownFormatter = lazy(() => import("@/pages/tools/markdown-formatter"));
const CssFormatter = lazy(() => import("@/pages/tools/css-formatter"));
const LessFormatter = lazy(() => import("@/pages/tools/less-formatter"));
const TimeFormatter = lazy(() => import("@/pages/tools/time-formatter"));
const Base64Encoder = lazy(() => import("@/pages/tools/base64-encoder"));
const UrlEncoder = lazy(() => import("@/pages/tools/url-encoder"));
const JwtDecoder = lazy(() => import("@/pages/tools/jwt-decoder"));
const TlsDecoder = lazy(() => import("@/pages/tools/tls-decoder"));
const TextDiff = lazy(() => import("@/pages/tools/text-diff"));
const RegexTester = lazy(() => import("@/pages/tools/regex-tester"));
const TextSort = lazy(() => import("@/pages/tools/text-sort"));
const TextCounter = lazy(() => import("@/pages/tools/text-counter"));
const TextSplit = lazy(() => import("@/pages/tools/text-split"));
const SearchReplace = lazy(() => import("@/pages/tools/search-replace"));
const WorldClock = lazy(() => import("@/pages/tools/world-clock"));
const Timer = lazy(() => import("@/pages/tools/timer"));
const Stopwatch = lazy(() => import("@/pages/tools/stopwatch"));
const Countdown = lazy(() => import("@/pages/tools/countdown"));
const CompoundInterest = lazy(() => import("@/pages/tools/compound-interest"));
const DebtRepayment = lazy(() => import("@/pages/tools/debt-repayment"));
const ColorPaletteGenerator = lazy(() => import("@/pages/tools/color-palette-generator"));
const CameraTest = lazy(() => import("@/pages/tools/webcam-test"));
const MicrophoneTest = lazy(() => import("@/pages/tools/microphone-test"));
const KeyboardTest = lazy(() => import("@/pages/tools/keyboard-test"));
const QRGenerator = lazy(() => import("@/pages/tools/qr-generator"));
const BarcodeGenerator = lazy(() => import("@/pages/tools/barcode-generator"));
const LoremGenerator = lazy(() => import("@/pages/tools/lorem-generator"));
const UnicodeCharacters = lazy(() => import("@/pages/tools/unicode-characters"));
const MD5Hash = lazy(() => import("@/pages/tools/md5-hash"));
const BCryptHash = lazy(() => import("@/pages/tools/bcrypt-hash"));
const PasswordGenerator = lazy(() => import("@/pages/tools/password-generator"));
const UUIDGenerator = lazy(() => import("@/pages/tools/uuid-generator"));
const DateTimeDiff = lazy(() => import("@/pages/tools/datetime-diff"));
const Metronome = lazy(() => import("@/pages/tools/metronome"));
const BrowserInfo = lazy(() => import("@/pages/tools/browser-info"));
const URLToJSON = lazy(() => import("@/pages/tools/url-to-json"));
const CSVToJSON = lazy(() => import("@/pages/tools/csv-to-json"));
const NumberBaseConverter = lazy(() => import("@/pages/tools/number-base-converter"));

// Loading component for lazy-loaded pages
function LazyPageLoader({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading tool...</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        {/* Home - loaded immediately */}
        <Route path="/" component={Home} />
        
        {/* Conversions - lazy loaded */}
        <Route path="/tools/date-converter">
          <LazyPageLoader><DateConverter /></LazyPageLoader>
        </Route>
        <Route path="/tools/json-yaml-converter">
          <LazyPageLoader><JsonYamlConverter /></LazyPageLoader>
        </Route>
        <Route path="/tools/timezone-converter">
          <LazyPageLoader><TimezoneConverter /></LazyPageLoader>
        </Route>
        <Route path="/tools/unit-converter">
          <LazyPageLoader><UnitConverter /></LazyPageLoader>
        </Route>
        <Route path="/tools/url-to-json">
          <LazyPageLoader><URLToJSON /></LazyPageLoader>
        </Route>
        <Route path="/tools/csv-to-json">
          <LazyPageLoader><CSVToJSON /></LazyPageLoader>
        </Route>
        <Route path="/tools/number-base-converter">
          <LazyPageLoader><NumberBaseConverter /></LazyPageLoader>
        </Route>
        
        {/* Formatters - lazy loaded */}
        <Route path="/tools/json-formatter">
          <LazyPageLoader><JsonFormatter /></LazyPageLoader>
        </Route>
        <Route path="/tools/html-formatter">
          <LazyPageLoader><HtmlFormatter /></LazyPageLoader>
        </Route>
        <Route path="/tools/yaml-formatter">
          <LazyPageLoader><YamlFormatter /></LazyPageLoader>
        </Route>
        <Route path="/tools/markdown-formatter">
          <LazyPageLoader><MarkdownFormatter /></LazyPageLoader>
        </Route>
        <Route path="/tools/css-formatter">
          <LazyPageLoader><CssFormatter /></LazyPageLoader>
        </Route>
        <Route path="/tools/less-formatter">
          <LazyPageLoader><LessFormatter /></LazyPageLoader>
        </Route>
        <Route path="/tools/time-formatter">
          <LazyPageLoader><TimeFormatter /></LazyPageLoader>
        </Route>
        
        {/* Encoders - lazy loaded */}
        <Route path="/tools/base64">
          <LazyPageLoader><Base64Encoder /></LazyPageLoader>
        </Route>
        <Route path="/tools/url-encoder">
          <LazyPageLoader><UrlEncoder /></LazyPageLoader>
        </Route>
        <Route path="/tools/jwt-decoder">
          <LazyPageLoader><JwtDecoder /></LazyPageLoader>
        </Route>
        <Route path="/tools/tls-decoder">
          <LazyPageLoader><TlsDecoder /></LazyPageLoader>
        </Route>
        <Route path="/tools/md5-hash">
          <LazyPageLoader><MD5Hash /></LazyPageLoader>
        </Route>
        <Route path="/tools/bcrypt-hash">
          <LazyPageLoader><BCryptHash /></LazyPageLoader>
        </Route>
        
        {/* Text Tools - lazy loaded */}
        <Route path="/tools/text-diff">
          <LazyPageLoader><TextDiff /></LazyPageLoader>
        </Route>
        <Route path="/tools/regex-tester">
          <LazyPageLoader><RegexTester /></LazyPageLoader>
        </Route>
        <Route path="/tools/text-sort">
          <LazyPageLoader><TextSort /></LazyPageLoader>
        </Route>
        <Route path="/tools/text-counter">
          <LazyPageLoader><TextCounter /></LazyPageLoader>
        </Route>
        <Route path="/tools/text-split">
          <LazyPageLoader><TextSplit /></LazyPageLoader>
        </Route>
        <Route path="/tools/search-replace">
          <LazyPageLoader><SearchReplace /></LazyPageLoader>
        </Route>
        <Route path="/tools/qr-generator">
          <LazyPageLoader><QRGenerator /></LazyPageLoader>
        </Route>
        <Route path="/tools/barcode-generator">
          <LazyPageLoader><BarcodeGenerator /></LazyPageLoader>
        </Route>
        <Route path="/tools/lorem-generator">
          <LazyPageLoader><LoremGenerator /></LazyPageLoader>
        </Route>
        <Route path="/tools/unicode-characters">
          <LazyPageLoader><UnicodeCharacters /></LazyPageLoader>
        </Route>
        <Route path="/tools/password-generator">
          <LazyPageLoader><PasswordGenerator /></LazyPageLoader>
        </Route>
        <Route path="/tools/uuid-generator">
          <LazyPageLoader><UUIDGenerator /></LazyPageLoader>
        </Route>
        
        {/* Time Tools - lazy loaded */}
        <Route path="/tools/world-clock">
          <LazyPageLoader><WorldClock /></LazyPageLoader>
        </Route>
        <Route path="/tools/timer">
          <LazyPageLoader><Timer /></LazyPageLoader>
        </Route>
        <Route path="/tools/stopwatch">
          <LazyPageLoader><Stopwatch /></LazyPageLoader>
        </Route>
        <Route path="/tools/countdown">
          <LazyPageLoader><Countdown /></LazyPageLoader>
        </Route>
        <Route path="/tools/datetime-diff">
          <LazyPageLoader><DateTimeDiff /></LazyPageLoader>
        </Route>
        <Route path="/tools/metronome">
          <LazyPageLoader><Metronome /></LazyPageLoader>
        </Route>
        
        {/* Financial Tools - lazy loaded */}
        <Route path="/tools/compound-interest">
          <LazyPageLoader><CompoundInterest /></LazyPageLoader>
        </Route>
        <Route path="/tools/debt-repayment">
          <LazyPageLoader><DebtRepayment /></LazyPageLoader>
        </Route>
        
        {/* Color Tools - lazy loaded */}
        <Route path="/tools/color-palette-generator">
          <LazyPageLoader><ColorPaletteGenerator /></LazyPageLoader>
        </Route>
        
        {/* Hardware Tools - lazy loaded */}
        <Route path="/tools/webcam-test">
          <LazyPageLoader><CameraTest /></LazyPageLoader>
        </Route>
        <Route path="/tools/microphone-test">
          <LazyPageLoader><MicrophoneTest /></LazyPageLoader>
        </Route>
        <Route path="/tools/keyboard-test">
          <LazyPageLoader><KeyboardTest /></LazyPageLoader>
        </Route>
        
        {/* Browser Tools - lazy loaded */}
        <Route path="/tools/browser-info">
          <LazyPageLoader><BrowserInfo /></LazyPageLoader>
        </Route>
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DemoProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </DemoProvider>
    </QueryClientProvider>
  );
}

export default App;
