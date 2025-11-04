import "./App.css";
import { lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Languages, Brain, Sparkles, Loader2 } from "lucide-react";

// Lazy load feature components
const Translator = lazy(() =>
  import("@/components/features/translator").then(module => ({
    default: module.TranslatorFeatureComponent
  }))
);
const Summarizer = lazy(() =>
  import("@/components/features/summarizer").then(module => ({
    default: module.SummarizerFeatureComponent
  }))
);

// Loading fallback component
function FeatureLoadingFallback() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading feature...</p>
        </div>
      </CardContent>
    </Card>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-10 w-10 text-foreground" />
              <div>
                <CardTitle className="text-3xl">
                  Chrome Built-in AI APIs Demo
                </CardTitle>
                <CardDescription className="text-base">
                  Explore on-device AI capabilities with Chrome's experimental
                  APIs
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="translator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto p-2">
            <TabsTrigger
              value="translator"
              className="flex items-center gap-2 py-3"
            >
              <Languages className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Translator API</div>
                <div className="text-xs text-muted-foreground">
                  Multi-language translation
                </div>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="summarizer"
              className="flex items-center gap-2 py-3"
            >
              <Brain className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Summarizer API</div>
                <div className="text-xs text-muted-foreground">
                  Intelligent text summarization
                </div>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="translator" className="space-y-4">
            <Suspense fallback={<FeatureLoadingFallback />}>
              <Translator />
            </Suspense>
          </TabsContent>

          <TabsContent value="summarizer" className="space-y-4">
            <Suspense fallback={<FeatureLoadingFallback />}>
              <Summarizer />
            </Suspense>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-muted-foreground">
              Built with React, TypeScript, Vite, and shadcn/ui • Powered by
              Chrome's experimental Built-in AI APIs
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
