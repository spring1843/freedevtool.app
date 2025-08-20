import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/theme-provider";
import { DemoProvider } from "@/providers/demo-provider";
import { Layout } from "@/components/layout/Layout";

// Import all tool pages
import Home from "@/pages/home";
import DateConverter from "@/pages/tools/date-converter";
import JsonYamlConverter from "@/pages/tools/json-yaml-converter";
import TimezoneConverter from "@/pages/tools/timezone-converter";
import UnitConverter from "@/pages/tools/unit-converter";
import JsonFormatter from "@/pages/tools/json-formatter";
import JSONCFormatter from "@/pages/tools/jsonc-formatter";
import HtmlFormatter from "@/pages/tools/html-formatter";
import YamlFormatter from "@/pages/tools/yaml-formatter";
import MarkdownFormatter from "@/pages/tools/markdown-formatter";
import CssFormatter from "@/pages/tools/css-formatter";
import TypeScriptFormatter from "@/pages/tools/typescript-formatter";
import GraphQLFormatter from "@/pages/tools/graphql-formatter";
import TimeFormatter from "@/pages/tools/time-formatter";
import Base64Encoder from "@/pages/tools/base64-encoder";
import UrlEncoder from "@/pages/tools/url-encoder";
import JwtDecoder from "@/pages/tools/jwt-decoder";
import TlsDecoder from "@/pages/tools/tls-decoder";
import TextDiff from "@/pages/tools/text-diff";
import RegexTester from "@/pages/tools/regex-tester";
import TextSort from "@/pages/tools/text-sort";
import TextCounter from "@/pages/tools/text-counter";
import TextSplit from "@/pages/tools/text-split";
import SearchReplace from "@/pages/tools/search-replace";
import WorldClock from "@/pages/tools/world-clock";
import Timer from "@/pages/tools/timer";
import Stopwatch from "@/pages/tools/stopwatch";
import Countdown from "@/pages/tools/countdown";
import CompoundInterest from "@/pages/tools/compound-interest";
import DebtRepayment from "@/pages/tools/debt-repayment";
import ColorPaletteGenerator from "@/pages/tools/color-palette-generator";
import CameraTest from "@/pages/tools/webcam-test";
import MicrophoneTest from "@/pages/tools/microphone-test";
import KeyboardTest from "@/pages/tools/keyboard-test";
import QRGenerator from "@/pages/tools/qr-generator";
import BarcodeGenerator from "@/pages/tools/barcode-generator";
import LoremGenerator from "@/pages/tools/lorem-generator";
import UnicodeCharacters from "@/pages/tools/unicode-characters";
import MD5Hash from "@/pages/tools/md5-hash";
import BCryptHash from "@/pages/tools/bcrypt-hash";
import PasswordGenerator from "@/pages/tools/password-generator";
import UUIDGenerator from "@/pages/tools/uuid-generator";
import DateTimeDiff from "@/pages/tools/datetime-diff";
import Metronome from "@/pages/tools/metronome";

import BrowserInfo from "@/pages/tools/browser-info";
import URLToJSON from "@/pages/tools/url-to-json";
import CSVToJSON from "@/pages/tools/csv-to-json";
import NumberBaseConverter from "@/pages/tools/number-base-converter";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        {/* Home */}
        <Route path="/" component={Home} />

        {/* Conversions */}
        <Route path="/tools/date-converter" component={DateConverter} />
        <Route
          path="/tools/json-yaml-converter"
          component={JsonYamlConverter}
        />
        <Route path="/tools/timezone-converter" component={TimezoneConverter} />
        <Route path="/tools/unit-converter" component={UnitConverter} />
        <Route path="/tools/url-to-json" component={URLToJSON} />
        <Route path="/tools/csv-to-json" component={CSVToJSON} />
        <Route
          path="/tools/number-base-converter"
          component={NumberBaseConverter}
        />

        {/* Formatters */}
        <Route path="/tools/json-formatter" component={JsonFormatter} />
        <Route path="/tools/jsonc-formatter" component={JSONCFormatter} />
        <Route path="/tools/html-formatter" component={HtmlFormatter} />
        <Route path="/tools/yaml-formatter" component={YamlFormatter} />
        <Route path="/tools/markdown-formatter" component={MarkdownFormatter} />
        <Route path="/tools/css-formatter" component={CssFormatter} />
        <Route path="/tools/less-formatter" component={CssFormatter} />
        <Route path="/tools/scss-formatter" component={CssFormatter} />

        <Route
          path="/tools/typescript-formatter"
          component={TypeScriptFormatter}
        />
        <Route path="/tools/graphql-formatter" component={GraphQLFormatter} />
        <Route path="/tools/time-formatter" component={TimeFormatter} />

        {/* Encoders */}
        <Route path="/tools/base64" component={Base64Encoder} />
        <Route path="/tools/url-encoder" component={UrlEncoder} />
        <Route path="/tools/jwt-decoder" component={JwtDecoder} />
        <Route path="/tools/tls-decoder" component={TlsDecoder} />
        <Route path="/tools/md5-hash" component={MD5Hash} />
        <Route path="/tools/bcrypt-hash" component={BCryptHash} />

        {/* Text Tools */}
        <Route path="/tools/text-diff" component={TextDiff} />
        <Route path="/tools/regex-tester" component={RegexTester} />
        <Route path="/tools/text-sort" component={TextSort} />
        <Route path="/tools/text-counter" component={TextCounter} />
        <Route path="/tools/text-split" component={TextSplit} />
        <Route path="/tools/search-replace" component={SearchReplace} />
        <Route path="/tools/qr-generator" component={QRGenerator} />
        <Route path="/tools/barcode-generator" component={BarcodeGenerator} />
        <Route path="/tools/lorem-generator" component={LoremGenerator} />
        <Route path="/tools/unicode-characters" component={UnicodeCharacters} />
        <Route path="/tools/password-generator" component={PasswordGenerator} />
        <Route path="/tools/uuid-generator" component={UUIDGenerator} />

        {/* Time Tools */}
        <Route path="/tools/world-clock" component={WorldClock} />
        <Route path="/tools/timer" component={Timer} />
        <Route path="/tools/stopwatch" component={Stopwatch} />
        <Route path="/tools/countdown" component={Countdown} />
        <Route path="/tools/datetime-diff" component={DateTimeDiff} />
        <Route path="/tools/metronome" component={Metronome} />

        {/* Financial Tools */}
        <Route path="/tools/compound-interest" component={CompoundInterest} />
        <Route path="/tools/debt-repayment" component={DebtRepayment} />

        {/* Color Tools */}
        <Route
          path="/tools/color-palette-generator"
          component={ColorPaletteGenerator}
        />

        {/* Hardware Tools */}
        <Route path="/tools/webcam-test" component={CameraTest} />
        <Route path="/tools/microphone-test" component={MicrophoneTest} />
        <Route path="/tools/keyboard-test" component={KeyboardTest} />

        {/* Browser Tools */}
        <Route path="/tools/browser-info" component={BrowserInfo} />

        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <DemoProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </DemoProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
