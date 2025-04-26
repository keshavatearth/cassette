import { Input } from "@/components/ui/input";
import CurrentlyWatching from "@/components/dashboard/CurrentlyWatching";
import RecommendedContent from "@/components/dashboard/RecommendedContent";
import RecentReflections from "@/components/dashboard/RecentReflections";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get all content for search
  const { data: allContent } = useQuery({
    queryKey: ["/api/content"],
  });
  
  // Filter content based on search query
  const searchResults = searchQuery.length > 2 
    ? allContent?.filter((item: any) => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) 
    : [];
  
  // Handle adding content to watchlist
  const handleAddToLibrary = async (contentId: number) => {
    try {
      await apiRequest("POST", "/api/user-content", {
        contentId,
        status: "watchlist",
        rating: null,
        progress: 0,
        currentSeason: null,
        currentEpisode: null
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/user-content"] });
      toast({
        title: "Added to library",
        description: "Content has been added to your watchlist."
      });
      
      setSearchQuery("");
      setShowResults(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add content to library.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Home Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your viewing journey and reflections</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="relative">
          <Input
            type="text"
            placeholder="Quick add: Search for movies or shows"
            className="w-full pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(e.target.value.length > 2);
            }}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-muted-foreground"></i>
          </div>
        </div>
        
        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <Card className="absolute w-full z-10 mt-1 max-h-80 overflow-auto">
            <CardContent className="p-2">
              {searchResults.map((item: any) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-2 hover:bg-accent/10 rounded-md"
                >
                  <div className="flex items-center">
                    <img 
                      src={item.posterUrl} 
                      alt={item.title} 
                      className="w-12 h-12 object-cover rounded mr-3"
                    />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.year} • {item.type === 'tv' ? 'TV Series' : 'Movie'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleAddToLibrary(item.id)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        {showResults && searchQuery.length > 2 && searchResults.length === 0 && (
          <Card className="absolute w-full z-10 mt-1">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content Sections */}
      <CurrentlyWatching />
      <RecommendedContent />
      <RecentReflections />
    </div>
  );
};

export default HomePage;
