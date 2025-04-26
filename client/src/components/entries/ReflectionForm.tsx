import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAi } from "@/hooks/useAi";
import { Loader2, Lightbulb, Tag } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface ReflectionFormProps {
  contentId: number;
}

const ReflectionForm = ({ contentId }: ReflectionFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [showTimestampInput, setShowTimestampInput] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAiInsight, setShowAiInsight] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  
  // Use our AI hook for Gemini-powered features
  const { 
    getReflectionInsight, 
    reflectionInsight, 
    isLoadingReflectionInsight, 
    analyzeReflection,
    reflectionAnalysis,
    isLoadingAnalysis
  } = useAi();

  const addReflectionMutation = useMutation({
    mutationFn: async (data: { contentId: number; text: string; timestamp: string; tags: string[] }) => {
      return apiRequest("POST", "/api/reflections", data);
    },
    onSuccess: () => {
      setText("");
      setTimestamp("");
      setShowTimestampInput(false);
      setSelectedTags([]);
      queryClient.invalidateQueries({ queryKey: ["/api/reflections"] });
      queryClient.invalidateQueries({ queryKey: [`/api/reflections/content/${contentId}`] });
      toast({
        title: "Reflection added",
        description: "Your note has been saved."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add reflection. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Request an AI-powered insight based on the reflection text
  const handleGetInsight = () => {
    if (!text.trim()) {
      toast({
        title: "Empty reflection",
        description: "Please add some text to your reflection first.",
        variant: "destructive"
      });
      return;
    }
    
    // Get AI reflection insight
    getReflectionInsight({ contentId, reflectionText: text });
    setShowAiInsight(true);
  };
  
  // Get AI-suggested tags for the reflection
  const handleGetTags = () => {
    if (!text.trim()) {
      toast({
        title: "Empty reflection",
        description: "Please add some text to your reflection first.",
        variant: "destructive"
      });
      return;
    }
    
    // Analyze reflection and extract tags
    analyzeReflection(text);
  };
  
  // Apply AI-suggested tags to the reflection
  useEffect(() => {
    if (reflectionAnalysis && reflectionAnalysis.tags?.length > 0) {
      // Format tags with hashtag
      const formattedTags = reflectionAnalysis.tags.map(tag => 
        tag.startsWith('#') ? tag : `#${tag.replace(/\s+/g, '')}`
      );
      setSuggestedTags(formattedTags);
    }
  }, [reflectionAnalysis]);
  
  // Add the reflection note
  const handleAddNote = () => {
    if (!text.trim()) {
      toast({
        title: "Empty note",
        description: "Please add some text to your reflection.",
        variant: "destructive"
      });
      return;
    }

    addReflectionMutation.mutate({
      contentId,
      text,
      timestamp,
      tags: selectedTags
    });
    
    // Reset AI states
    setShowAiInsight(false);
    setSuggestedTags([]);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold text-lg mb-3">Add a Reflection</h2>
        <Textarea
          placeholder="Share your thoughts about a scene or moment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-[100px] mb-3"
        />
        
        {showTimestampInput && (
          <div className="mb-3">
            <input
              type="text"
              placeholder="HH:MM:SS or SXXEYY or scene description"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
        
        {/* AI-powered insights */}
        {showAiInsight && (
          <div className="mb-4">
            {isLoadingReflectionInsight ? (
              <div className="flex items-center gap-2 text-muted-foreground p-3 bg-muted rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating insight...</span>
              </div>
            ) : reflectionInsight ? (
              <Alert className="bg-primary/10 border-primary/20">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                  <AlertDescription className="text-sm">{reflectionInsight}</AlertDescription>
                </div>
              </Alert>
            ) : null}
          </div>
        )}
        
        {/* AI suggested tags */}
        {suggestedTags.length > 0 && (
          <div className="mb-3">
            <div className="text-sm font-medium mb-1 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              <span>Suggested tags:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {suggestedTags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setSelectedTags(prev => 
                    prev.includes(tag) ? prev : [...prev, tag]
                  )}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            onClick={handleAddNote}
            disabled={addReflectionMutation.isPending}
          >
            <i className="fas fa-plus mr-2"></i> Add Note
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setShowTimestampInput(!showTimestampInput)}
          >
            <i className="fas fa-clock mr-2"></i> {showTimestampInput ? 'Hide Timestamp' : 'Add Timestamp'}
          </Button>
          
          <Button 
            variant="outline"
            size="icon"
            className="ml-auto"
            onClick={handleGetInsight}
            disabled={isLoadingReflectionInsight}
            title="Get AI insight"
          >
            <Lightbulb className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline"
            size="icon"
            onClick={handleGetTags}
            disabled={isLoadingAnalysis}
            title="Suggest AI tags"
          >
            <Tag className="h-4 w-4" />
          </Button>
          
          <div className="flex flex-wrap gap-1 ml-2">
            <ToggleGroup type="multiple" value={selectedTags} onValueChange={setSelectedTags}>
              <ToggleGroupItem value="#MindBlown" size="sm" className="px-2 py-1 text-xs">
                #MindBlown
              </ToggleGroupItem>
              <ToggleGroupItem value="#LOL" size="sm" className="px-2 py-1 text-xs">
                #LOL
              </ToggleGroupItem>
              <ToggleGroupItem value="#WellWritten" size="sm" className="px-2 py-1 text-xs">
                #WellWritten
              </ToggleGroupItem>
              <ToggleGroupItem value="#PlotHole" size="sm" className="px-2 py-1 text-xs">
                #PlotHole
              </ToggleGroupItem>
              <ToggleGroupItem value="#CharacterMoment" size="sm" className="px-2 py-1 text-xs">
                #CharacterMoment
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReflectionForm;
