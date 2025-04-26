import { useState } from "react";
import { useAi } from "@/hooks/useAi";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2, AlertCircle, ThumbsUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Recommendation {
  title: string;
  type: string; // 'movie' or 'tv'
  reason: string;
}

const GeminiRecommendations = () => {
  const [mood, setMood] = useState<string>("");
  const [time, setTime] = useState<number>(0);
  const [customMood, setCustomMood] = useState<string>("");
  const [showCustomMood, setShowCustomMood] = useState<boolean>(false);

  const { 
    getRecommendations, 
    recommendations, 
    isLoadingRecommendations 
  } = useAi();

  const handleGetRecommendations = () => {
    const moodValue = showCustomMood ? customMood : mood;
    getRecommendations({ 
      mood: moodValue, 
      timeAvailable: time > 0 ? time : undefined 
    });
  };

  const handleMoodChange = (value: string) => {
    if (value === "custom") {
      setShowCustomMood(true);
      setMood(value);
    } else {
      setShowCustomMood(false);
      setMood(value);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <ThumbsUp className="h-5 w-5" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mood">What are you in the mood for?</Label>
            <Select value={mood} onValueChange={handleMoodChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a mood..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="something fun and light">Fun & Light</SelectItem>
                <SelectItem value="something emotional">Emotional</SelectItem>
                <SelectItem value="something thrilling">Thrilling</SelectItem>
                <SelectItem value="something thought-provoking">Thought-provoking</SelectItem>
                <SelectItem value="something relaxing">Relaxing</SelectItem>
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
            
            {showCustomMood && (
              <Input
                placeholder="Describe what you're in the mood for..."
                value={customMood}
                onChange={(e) => setCustomMood(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="time">How much time do you have?</Label>
              <span className="text-sm text-muted-foreground">
                {time === 0 ? "Any length" : `${time} minutes`}
              </span>
            </div>
            <Slider
              value={[time]}
              min={0}
              max={240}
              step={15}
              onValueChange={(value) => setTime(value[0])}
              className="py-4"
            />
          </div>
          
          <Button 
            onClick={handleGetRecommendations} 
            disabled={isLoadingRecommendations || (!mood && !customMood)}
            className="w-full"
          >
            {isLoadingRecommendations ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting recommendations...
              </>
            ) : "Get AI Recommendations"}
          </Button>
        </div>
        
        {recommendations && recommendations.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-medium text-lg">Recommended for you:</h3>
            {recommendations.map((rec: Recommendation, index: number) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {rec.type === 'movie' ? '🎬' : '📺'}
                    </div>
                    <div>
                      <h4 className="font-semibold">{rec.title}</h4>
                      <div className="text-sm text-muted-foreground mt-1">{rec.reason}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {recommendations && recommendations.length === 0 && (
          <Alert className="mt-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No recommendations found for your criteria. Try adjusting your preferences.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default GeminiRecommendations;