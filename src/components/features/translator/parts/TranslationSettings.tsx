import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Download } from "lucide-react";
import { LANGUAGES } from "../shared/constants";

type Props = {
  sourceLanguage: string;
  targetLanguage: string;
  setSourceLanguage: (v: string) => void;
  setTargetLanguage: (v: string) => void;
  streamingMode: boolean;
  setStreamingMode: (v: boolean) => void;
  isDownloading: boolean;
  downloadProgress: number;
  swapLanguages: () => void;
};

const TranslationSettings: React.FC<Props> = ({
  sourceLanguage,
  targetLanguage,
  setSourceLanguage,
  setTargetLanguage,
  streamingMode,
  setStreamingMode,
  isDownloading,
  downloadProgress,
  swapLanguages,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Translation Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-2">
            <Label htmlFor="source-lang">Source Language</Label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger id="source-lang">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={swapLanguages}
              className="rounded-full"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-lang">Target Language</Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger id="target-lang">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="streaming-mode">Streaming Translation</Label>
            <p className="text-sm text-muted-foreground">
              See translation appear word by word in real-time
            </p>
          </div>
          <Switch
            id="streaming-mode"
            checked={streamingMode}
            onCheckedChange={setStreamingMode}
          />
        </div>
        {isDownloading && (
          <Alert>
            <Download className="h-4 w-4" />
            <AlertTitle>Downloading Language Pack</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                Downloading {sourceLanguage} → {targetLanguage} translation
                model...
              </p>
              <Progress value={downloadProgress} className="mt-2" />
              <p className="text-sm">{downloadProgress.toFixed(0)}% complete</p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TranslationSettings;
