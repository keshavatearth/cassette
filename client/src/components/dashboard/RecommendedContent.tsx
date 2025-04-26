import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RecommendedContent = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mood, setMood] = useState<string>("any");
  const [time, setTime] = useState<string>("any");
  
  // Get all content
  const { data: allContent, isLoading } = useQuery({
    queryKey: ["/api/content"],
  });
  
  // Get user's content to filter out already added content
  const { data: userContent } = useQuery({
    queryKey: ["/api/user-content"],
  });
  
  // Add content to user's watchlist
  const addToWatchlistMutation = useMutation({
    mutationFn: async (contentId: number) => {
      return apiRequest("POST", "/api/user-content", {
        contentId,
        status: "watchlist",
        rating: null,
        progress: 0,
        currentSeason: null,
        currentEpisode: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-content"] });
      toast({
        title: "Added to watchlist",
        description: "Content has been added to your watchlist.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add content to watchlist.",
        variant: "destructive",
      });
    }
  });
  
  // Filter content based on user's existing content and selected filters
  const getFilteredContent = () => {
    if (!allContent) return [];
    
    // Get content IDs that user already has
    const userContentIds = userContent?.map((item: any) => item.contentId) || [];
    
    // Filter out content user already has
    let filtered = allContent.filter((content: any) => 
      !userContentIds.includes(content.id)
    );
    
    // Apply mood filter
    if (mood !== "any") {
      const moodGenreMap: Record<string, string[]> = {
        "funny": ["Comedy"],
        "intense": ["Thriller", "Horror", "Action"],
        "relaxing": ["Drama", "Romance"],
        "thoughtprovoking": ["Sci-Fi", "Mystery", "Drama"]
      };
      
      filtered = filtered.filter((content: any) => 
        content.genres.some((genre: string) => 
          moodGenreMap[mood]?.includes(genre)
        )
      );
    }
    
    // Apply time filter
    if (time !== "any") {
      if (time === "short") {
        filtered = filtered.filter((content: any) => 
          content.type === "movie" ? content.runtime < 90 : content.episodes < 6
        );
      } else if (time === "medium") {
        filtered = filtered.filter((content: any) => 
          content.type === "movie" ? 
            (content.runtime >= 90 && content.runtime <= 150) : 
            (content.episodes >= 6 && content.episodes <= 10)
        );
      } else if (time === "long") {
        filtered = filtered.filter((content: any) => 
          content.type === "movie" ? content.runtime > 150 : content.episodes > 10
        );
      }
    }
    
    // Return 4 random items
    return filtered.sort(() => 0.5 - Math.random()).slice(0, 4);
  };

  const recommendedContent = getFilteredContent();
  
  const handleAddToWatchlist = (contentId: number) => {
    addToWatchlistMutation.mutate(contentId);
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-semibold">What to Watch Next?</h2>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="bg-background px-4 py-2 rounded-full shadow-sm border border-border">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Mood:</span>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="w-auto border-0 p-0 h-auto text-sm bg-transparent focus:ring-0">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="funny">Funny</SelectItem>
                <SelectItem value="intense">Intense</SelectItem>
                <SelectItem value="relaxing">Relaxing</SelectItem>
                <SelectItem value="thoughtprovoking">Thought-provoking</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="bg-background px-4 py-2 rounded-full shadow-sm border border-border">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Time:</span>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="w-auto border-0 p-0 h-auto text-sm bg-transparent focus:ring-0">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="short">&lt; 1 hour</SelectItem>
                <SelectItem value="medium">1-2 hours</SelectItem>
                <SelectItem value="long">2+ hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <Skeleton className="w-full h-36" />
              <CardContent className="p-3">
                <Skeleton className="h-5 w-4/5 mb-2" />
                <div className="flex items-center justify-between mt-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-8 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : recommendedContent.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No recommendations match your filters.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedContent.map((item: any) => (
            <Card key={item.id} className="overflow-hidden">
              <img 
                src={item.posterUrl} 
                alt={item.title} 
                className="w-full h-36 object-cover"
              />
              <CardContent className="p-3">
                <h3 className="font-medium">{item.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {item.type === 'tv' 
                      ? `Series • ${item.seasons} Season${item.seasons > 1 ? 's' : ''}` 
                      : `Movie • ${item.runtime}m`}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAddToWatchlist(item.id)}
                    disabled={addToWatchlistMutation.isPending}
                    className="text-xs bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    + Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default RecommendedContent;
