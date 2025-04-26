import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import GeminiRecommendations from "@/components/discover/GeminiRecommendations";

const DiscoverPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  // Get all content
  const { data: allContent, isLoading } = useQuery({
    queryKey: ["/api/content"],
  });

  // Get user's content for comparison
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

  // Filter out content the user already has
  const getUnwatchedContent = () => {
    if (!allContent || !userContent) return [];
    
    // Get content IDs that user already has
    const userContentIds = userContent.map((item: any) => item.contentId);
    
    // Filter out content user already has
    return allContent.filter((content: any) => 
      !userContentIds.includes(content.id)
    );
  };

  // Get content recommendations based on mood/time
  const getMoodBasedContent = () => {
    const unwatchedContent = getUnwatchedContent();
    // For demo purposes, just return some random items
    return unwatchedContent.sort(() => 0.5 - Math.random()).slice(0, 4);
  };

  // Get content by selected person
  const getContentByPerson = () => {
    if (!selectedPerson) return [];
    
    return allContent?.filter((content: any) => 
      content.cast.some((castMember: string) => 
        castMember.toLowerCase().includes(selectedPerson.toLowerCase())
      )
    );
  };

  // Get recommendations based on user's tags/genres
  const getRecommendationsBasedOnTaste = () => {
    if (!allContent || !userContent) return [];
    
    // In a real app, this would do more sophisticated analysis
    // For now, just return some random unwatched content
    return getUnwatchedContent().sort(() => 0.5 - Math.random()).slice(0, 4);
  };

  const handleAddToWatchlist = (contentId: number) => {
    addToWatchlistMutation.mutate(contentId);
  };

  const handlePersonSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedPerson(searchQuery);
  };

  const recommendedContent = getMoodBasedContent();
  const tasteBasedContent = getRecommendationsBasedOnTaste();
  const personContent = getContentByPerson();

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Discover New Content</h1>
        <p className="text-muted-foreground mt-1">Find movies and shows based on your taste</p>
      </div>

      {/* Based on Your Reflections */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Based on Your Reflections</h2>
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
        ) : tasteBasedContent.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Add more content to your library to get personalized recommendations.</p>
            <Link href="/library">
              <a className="text-primary hover:text-primary/90 font-medium">Go to your library</a>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tasteBasedContent.map((item: any) => (
              <Card key={item.id} className="overflow-hidden">
                <img 
                  src={item.posterUrl} 
                  alt={item.title} 
                  className="w-full h-36 object-cover"
                />
                <CardContent className="p-3">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    Based on your interest in {item.genres[0] || 'similar content'}
                  </p>
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

      {/* AI-Powered Recommendations */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">AI-Powered Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <GeminiRecommendations />
          </div>
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">How it works</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Our AI-powered recommendation system uses Google's Gemini AI to analyze your preferences and suggest content that matches your mood and available time.
              </p>
              <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
                <li>Tell us what you're in the mood for</li>
                <li>Set how much time you have available</li>
                <li>Get personalized recommendations</li>
                <li>Add recommendations to your watchlist</li>
              </ul>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-2">Popular Moods</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="rounded-full">Something fun</Button>
                <Button variant="outline" size="sm" className="rounded-full">Something emotional</Button>
                <Button variant="outline" size="sm" className="rounded-full">Something thrilling</Button>
                <Button variant="outline" size="sm" className="rounded-full">Something relaxing</Button>
                <Button variant="outline" size="sm" className="rounded-full">Something thought-provoking</Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Explore by Mood & Time - Legacy system */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Manual Recommendations</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="bg-background px-4 py-2 rounded-full shadow-sm border border-border">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Mood:</span>
              <select className="text-sm bg-transparent focus:outline-none">
                <option>Any</option>
                <option>Funny</option>
                <option>Intense</option>
                <option>Relaxing</option>
                <option>Thought-provoking</option>
              </select>
            </div>
          </div>
          
          <div className="bg-background px-4 py-2 rounded-full shadow-sm border border-border">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Time:</span>
              <select className="text-sm bg-transparent focus:outline-none">
                <option>Any</option>
                <option>&lt; 1 hour</option>
                <option>1-2 hours</option>
                <option>2+ hours</option>
              </select>
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
            <p className="text-muted-foreground">No content matches your criteria.</p>
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

      {/* Explore by People */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Explore by People</h2>
        <form onSubmit={handlePersonSearch} className="mb-6">
          <div className="flex flex-wrap md:flex-nowrap gap-2">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search for actors or directors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-muted-foreground"></i>
              </div>
            </div>
            <Button type="submit">Search</Button>
          </div>
        </form>
        
        {selectedPerson && (
          <>
            <h3 className="text-lg font-medium mb-4">Content with {selectedPerson}</h3>
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
            ) : personContent.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No content found with {selectedPerson}.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {personContent.map((item: any) => (
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
          </>
        )}
      </section>
    </div>
  );
};

export default DiscoverPage;
