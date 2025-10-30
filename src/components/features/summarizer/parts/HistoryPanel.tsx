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
import { Separator } from "@/components/ui/separator";

type HistoryItem = {
  type: string;
  original: string;
  summary: string;
  timestamp: string; // ISO string for portability
};

type Props = {
  summaryHistory: HistoryItem[];
};

const HistoryPanel: React.FC<Props> = ({ summaryHistory }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary History</CardTitle>
        <CardDescription>Recent summaries (last 10)</CardDescription>
      </CardHeader>
      <CardContent>
        {summaryHistory.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No summaries yet. Start summarizing to see history.
          </p>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {summaryHistory.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{item.type}</Badge>
                    <span className="text-muted-foreground">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-xs font-semibold mb-1">Original:</p>
                      <p className="text-sm line-clamp-3">{item.original}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded">
                      <p className="text-xs font-semibold mb-1">Summary:</p>
                      <p className="text-sm">{item.summary}</p>
                    </div>
                  </div>
                  {index < summaryHistory.length - 1 && (
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


