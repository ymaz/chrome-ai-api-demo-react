import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Languages, Loader2 } from "lucide-react";

type Props = {
  inputText: string;
  setInputText: (v: string) => void;
  detectLanguage: () => void;
  isDetecting: boolean;
  isTranslating: boolean;
  streamingMode: boolean;
  streamedText: string;
  translatedText: string;
  copyToClipboard: (text: string) => void;
  translateText: () => void;
  clearAll: () => void;
};

const TranslationIO: React.FC<Props> = ({
  inputText,
  setInputText,
  detectLanguage,
  isDetecting,
  isTranslating,
  streamingMode,
  streamedText,
  translatedText,
  copyToClipboard,
  translateText,
  clearAll,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Input Text</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={detectLanguage}
                disabled={!inputText || isDetecting}
              >
                {isDetecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Auto-Detect
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={inputText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInputText(e.target.value)
              }
              placeholder="Enter text to translate..."
              className="min-h-[200px]"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {inputText.length} characters
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(inputText)}
                disabled={!inputText}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Translated Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={
                streamingMode && isTranslating ? streamedText : translatedText
              }
              readOnly
              placeholder="Translation will appear here..."
              className="min-h-[200px]"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {translatedText.length} characters
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(translatedText)}
                disabled={!translatedText}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={translateText}
              disabled={isTranslating || !inputText}
              className="flex-1"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4 mr-2" />
                  Translate
                </>
              )}
            </Button>
            <Button variant="outline" onClick={clearAll}>
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TranslationIO;
