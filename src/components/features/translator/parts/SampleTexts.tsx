import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LANGUAGES, SAMPLE_TEXTS } from "../constants";

type Props = {
  onLoadSample: (sample: (typeof SAMPLE_TEXTS)[0]) => void;
};

const SampleTexts: React.FC<Props> = ({ onLoadSample }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sample Texts</CardTitle>
        <CardDescription>Click to load sample text for testing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SAMPLE_TEXTS.map((sample, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start text-left h-auto p-3 w-full"
              onClick={() => onLoadSample(sample)}
            >
              <div className="space-y-1 w-full">
                <div className="flex items-center gap-2">
                  <span>
                    {LANGUAGES.find((l) => l.code === sample.lang)?.flag}
                  </span>
                  <span className="font-medium">
                    {LANGUAGES.find((l) => l.code === sample.lang)?.name}
                  </span>
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
