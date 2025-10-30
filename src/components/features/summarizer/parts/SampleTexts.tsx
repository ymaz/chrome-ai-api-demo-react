import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { SAMPLE_TEXTS } from "../constants";

type Props = {
  onLoadSample: (sample: (typeof SAMPLE_TEXTS)[number]) => void;
};

const SampleTexts: React.FC<Props> = ({ onLoadSample }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sample Texts</CardTitle>
        <CardDescription>
          Click to load sample text for testing different summary types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_TEXTS.map((sample, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start text-left h-auto p-3 w-full"
              onClick={() => onLoadSample(sample)}
            >
              <div className="space-y-1 w-full">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{sample.title}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate w-full">
                  {sample.text}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SampleTexts;
