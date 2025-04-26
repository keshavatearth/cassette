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
          
          <div className="flex flex-wrap gap-1 ml-auto">
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
