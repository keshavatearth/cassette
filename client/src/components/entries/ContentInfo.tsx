import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ContentInfoProps {
  contentId: number;
}

const ContentInfo = ({ contentId }: ContentInfoProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get content details
  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: [`/api/content/${contentId}`],
  });
  
  // Get user's relationship with content
  const { data: userContent, isLoading: userContentLoading } = useQuery({
    queryKey: ["/api/user-content"],
    select: (data) => data.find((item: any) => item.contentId === contentId),
  });
  
  // Update user content relationship
  const updateUserContentMutation = useMutation({
    mutationFn: async (data: any) => {
      if (userContent) {
        return apiRequest("PATCH", `/api/user-content/${userContent.id}`, data);
      } else {
        return apiRequest("POST", "/api/user-content", {
          contentId,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-content"] });
      toast({
        title: "Updated",
        description: "Your content status has been updated."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleStatusChange = (status: string) => {
    updateUserContentMutation.mutate({ status });
  };
  
  const handleRating = (rating: number) => {
    updateUserContentMutation.mutate({ rating });
  };
  
  const handleNextEpisode = () => {
    if (!userContent || !content) return;
    
    let nextEpisode = userContent.currentEpisode + 1;
    let nextSeason = userContent.currentSeason;
    
    if (content.type === 'tv' && nextEpisode > content.episodes) {
      nextEpisode = 1;
      nextSeason++;
    }
    
    updateUserContentMutation.mutate({
      currentEpisode: nextEpisode,
      currentSeason: nextSeason
    });
  };
  
  const isLoading = contentLoading || userContentLoading;
  
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <Skeleton className="w-full h-48" />
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
          
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
            
            <div>
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-48 mt-2" />
            </div>
            
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
            
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <div className="flex flex-wrap gap-1">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <div className="flex flex-wrap gap-1">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!content) {
    return (
      <Card className="p-6 text-center">
        <p className="text-destructive">Content not found.</p>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <img 
        src={content.posterUrl} 
        alt={content.title} 
        className="w-full h-48 object-cover"
      />
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-xl">{content.title}</h2>
            <p className="text-muted-foreground text-sm">
              {content.year} • {content.type === 'tv' ? `${content.seasons} Season${content.seasons > 1 ? 's' : ''}` : `${content.runtime}m`}
            </p>
          </div>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                onClick={() => handleRating(star)} 
                className="focus:outline-none"
              >
                <i className={`fas fa-star ${userContent?.rating >= star ? 'text-yellow-400' : 'text-muted'}`}></i>
              </button>
            ))}
            {userContent?.rating && (
              <span className="ml-1 text-sm font-medium">{userContent.rating}</span>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Watch Status */}
          <div>
            <h3 className="font-medium text-sm uppercase text-muted-foreground mb-2">Your Status</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm"
                variant={userContent?.status === 'watching' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('watching')}
              >
                Currently Watching
              </Button>
              <Button 
                size="sm"
                variant={userContent?.status === 'watched' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('watched')}
              >
                Watched
              </Button>
              <Button 
                size="sm"
                variant={userContent?.status === 'watchlist' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('watchlist')}
              >
                Watchlist
              </Button>
            </div>
          </div>
          
          {/* Progress (for TV shows) */}
          {content.type === 'tv' && userContent?.status === 'watching' && (
            <div>
              <h3 className="font-medium text-sm uppercase text-muted-foreground mb-2">Your Progress</h3>
              <p className="text-sm">
                Watched up to: <span className="font-medium">
                  Season {userContent.currentSeason}, Episode {userContent.currentEpisode}
                </span>
              </p>
              <div className="mt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                  onClick={handleNextEpisode}
                >
                  Mark S{String(userContent.currentSeason).padStart(2, '0')}
                  E{String(userContent.currentEpisode + 1).padStart(2, '0')} as watched
                </Button>
              </div>
            </div>
          )}
          
          {/* Synopsis */}
          <div>
            <h3 className="font-medium text-sm uppercase text-muted-foreground mb-2">Synopsis</h3>
            <p className="text-sm text-muted-foreground">{content.synopsis}</p>
          </div>
          
          {/* Cast */}
          <div>
            <h3 className="font-medium text-sm uppercase text-muted-foreground mb-2">Key Cast</h3>
            <div className="flex flex-wrap gap-1 text-sm">
              {content.cast.map((actor: string, index: number) => (
                <div key={index}>
                  <Link href={`/person/${actor.toLowerCase().replace(/\s+/g, '-')}`}>
                    <a className="text-primary hover:text-primary/90">
                      {actor}
                    </a>
                  </Link>
                  {index < content.cast.length - 1 && ', '}
                </div>
              ))}
            </div>
          </div>
          
          {/* Genres */}
          <div>
            <h3 className="font-medium text-sm uppercase text-muted-foreground mb-2">Genres</h3>
            <div className="flex flex-wrap gap-1">
              {content.genres.map((genre: string, index: number) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentInfo;
