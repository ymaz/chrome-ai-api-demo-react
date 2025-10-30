import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle } from "lucide-react";
import { LANGUAGES } from "../constants";

type Props = {
  inputText: string;
  setInputText: (v: string) => void;
  onDetect: (text: string) => Promise<{ lang: string; conf: number } | null>;
};

const DetectionPanel: React.FC<Props> = ({
  inputText,
  setInputText,
  onDetect,
}) => {
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [detectedLanguage, setDetectedLanguage] = React.useState<string>("");
  const [detectionConfidence, setDetectionConfidence] =
    React.useState<number>(0);

  const handleDetect = async () => {
    if (!inputText) return;
    setIsDetecting(true);
    setDetectedLanguage("");
    setDetectionConfidence(0);
    try {
      const result = await onDetect(inputText);
      if (result) {
        setDetectedLanguage(result.lang);
        setDetectionConfidence(result.conf);
      }
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language Detection</CardTitle>
        <CardDescription>
          Automatically detect the language of any text
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to detect language..."
          className="min-h-[150px]"
        />
        <Button
          onClick={handleDetect}
          disabled={!inputText || isDetecting}
          className="w-full"
        >
          {isDetecting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Detecting...
            </>
          ) : (
            <>Detect Language</>
          )}
        </Button>
        {detectedLanguage && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Language Detected</AlertTitle>
            <AlertDescription>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Language:</span>
                  <Badge variant="outline">
                    {LANGUAGES.find((l) => l.code === detectedLanguage)?.flag}{" "}
                    {LANGUAGES.find((l) => l.code === detectedLanguage)?.name ||
                      detectedLanguage}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Confidence:</span>
                  <Progress
                    value={detectionConfidence * 100}
                    className="flex-1"
                  />
                  <span className="text-sm">
                    {(detectionConfidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DetectionPanel;
