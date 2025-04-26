import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentItemProps {
  id: number;
  title: string;
  posterUrl: string;
  type: string;
  progress: number;
  currentSeason?: number;
  currentEpisode?: number;
  seasons?: number;
  episodes?: number;
  runtime?: number;
  hasUpdate: boolean;
  updateText?: string;
}

const ContentItem = ({
  id,
  title,
  posterUrl,
  type,
  progress,
  currentSeason,
  currentEpisode,
  seasons,
  episodes,
  runtime,
  hasUpdate,
  updateText
}: ContentItemProps) => {
  // Calculate progress percentage
  const progressPercentage = type === 'movie' 
    ? (progress / (runtime || 100)) * 100 
    : ((currentSeason! * episodes! + currentEpisode!) / (seasons! * episodes!)) * 100;
  
  // Format progress text
  const progressText = type === 'movie' 
    ? `${progress}m / ${runtime}m` 
    : `Season ${currentSeason}, Episode ${currentEpisode} / Season ${seasons}`;
  
  return (
    <Card className="overflow-hidden h-full">
      <div className="relative">
        <img src={posterUrl} alt={title} className="w-full h-40 object-cover" />
        {hasUpdate && (
          <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
            {updateText || '+ New Content!'}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <span>{progressText}</span>
        </div>
        <div className="mt-3 w-full">
          <Progress value={progressPercentage} className="h-2" />
        </div>
        <div className="mt-4">
          <Link href={`/entry/${id}`}>
            <a className="text-primary hover:text-primary/90 text-sm font-medium">View/Add Reflections</a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const CurrentlyWatching = () => {
  const { data: watchingContent, isLoading, error } = useQuery({
    queryKey: ["/api/user-content/status/watching"],
  });

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-semibold">Currently Engaging With</h2>
        <Link href="/library">
          <a className="text-primary hover:text-primary/90 text-sm font-medium">See all</a>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="w-full h-40" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-2 w-full mb-4" />
                <Skeleton className="h-5 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-destructive">Error loading content. Please try again.</div>
      ) : watchingContent?.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">You're not currently watching anything.</p>
          <Link href="/discover">
            <a className="text-primary hover:text-primary/90 font-medium">Find something to watch</a>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchingContent?.map((item: any) => (
            <ContentItem
              key={item.id}
              id={item.contentId}
              title={item.content.title}
              posterUrl={item.content.posterUrl}
              type={item.content.type}
              progress={item.progress || 0}
              currentSeason={item.currentSeason}
              currentEpisode={item.currentEpisode}
              seasons={item.content.seasons}
              episodes={item.content.episodes}
              runtime={item.content.runtime}
              hasUpdate={Math.random() > 0.5} // Simulate updates for demo
              updateText={item.content.type === 'tv' ? 
                (Math.random() > 0.5 ? '+ New Season!' : `+ ${Math.floor(Math.random() * 5) + 1} Episodes`) : 
                undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CurrentlyWatching;
