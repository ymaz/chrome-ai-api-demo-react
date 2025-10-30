import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { LANGUAGES } from "../constants";

type HistoryItem = {
  source: string;
  target: string;
  original: string;
  translated: string;
  timestamp: string; // Was Date, now string ISO
};

type Props = {
  translationHistory: HistoryItem[];
};

const HistoryPanel: React.FC<Props> = ({ translationHistory }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Translation History</CardTitle>
        <CardDescription>Recent translations (last 10)</CardDescription>
      </CardHeader>
      <CardContent>
        {translationHistory.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No translations yet. Start translating to see history.
          </p>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {translationHistory.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {LANGUAGES.find((l) => l.code === item.source)?.flag}{" "}
                        {item.source.toUpperCase()}
                      </Badge>
                      <ArrowRight className="h-3 w-3" />
                      <Badge variant="outline">
                        {LANGUAGES.find((l) => l.code === item.target)?.flag}{" "}
                        {item.target.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm">{item.original}</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm">{item.translated}</p>
                    </div>
                  </div>
                  {index < translationHistory.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryPanel;
