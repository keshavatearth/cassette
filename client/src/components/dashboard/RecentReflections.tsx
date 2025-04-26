import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface ReflectionProps {
  id: number;
  contentId: number;
  contentTitle: string;
  timestamp: string;
  text: string;
  tags: string[];
}

const ReflectionItem = ({ 
  contentId, 
  contentTitle, 
  timestamp, 
  text, 
  tags 
}: ReflectionProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <span className="font-medium text-foreground">{contentTitle}</span>
          <span className="mx-2">•</span>
          <span>{timestamp}</span>
        </div>
        <p className="text-foreground">{text}</p>
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2">
          <Link href={`/entry/${contentId}`}>
            <a className="text-primary hover:text-primary/90 text-sm font-medium">View full reflections</a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const RecentReflections = () => {
  const { data: reflections, isLoading, error } = useQuery({
    queryKey: ["/api/reflections"],
  });
  
  // Sort and limit to 3 most recent reflections
  const recentReflections = reflections?.slice(0, 3) || [];

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-semibold">Your Recent Reflections</h2>
        <Link href="/reflections">
          <a className="text-primary hover:text-primary/90 text-sm font-medium">View all</a>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <Skeleton className="h-4 w-24 mr-2" />
                  <Skeleton className="h-4 w-4 mx-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-16 w-full mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-destructive">Error loading reflections. Please try again.</div>
      ) : recentReflections.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">You haven't added any reflections yet.</p>
          <Link href="/library">
            <a className="text-primary hover:text-primary/90 font-medium">Go to your library</a>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {recentReflections.map((reflection: any) => (
            <ReflectionItem
              key={reflection.id}
              id={reflection.id}
              contentId={reflection.contentId}
              contentTitle={reflection.content.title}
              timestamp={reflection.timestamp || ''}
              text={reflection.text}
              tags={reflection.tags || []}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default RecentReflections;
