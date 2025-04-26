import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface ReflectionStreamProps {
  contentId: number;
}

const ReflectionStream = ({ contentId }: ReflectionStreamProps) => {
  const { data: reflections, isLoading, error } = useQuery({
    queryKey: [`/api/reflections/content/${contentId}`],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Your Reflection Stream</h2>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center text-sm mb-2">
                <Skeleton className="h-4 w-32 mr-2" />
                <Skeleton className="h-4 w-4 mx-2" />
                <Skeleton className="h-4 w-16 mr-2" />
                <Skeleton className="h-4 w-4 mx-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-16 w-full mb-2" />
              <div className="mt-2 flex gap-1">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="mt-3 text-right">
                <Skeleton className="h-8 w-32 ml-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="font-semibold text-lg">Your Reflection Stream</h2>
        <Card className="p-4 mt-4 bg-destructive/10 border-destructive/20">
          <p className="text-destructive">Error loading reflections. Please try again.</p>
        </Card>
      </div>
    );
  }

  if (reflections?.length === 0) {
    return (
      <div>
        <h2 className="font-semibold text-lg">Your Reflection Stream</h2>
        <Card className="p-6 mt-4 text-center">
          <p className="text-muted-foreground mb-2">No reflections yet.</p>
          <p className="text-sm text-muted-foreground">Add your first reflection using the form above!</p>
        </Card>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Your Reflection Stream</h2>
      
      {reflections?.map((reflection: any) => (
        <Card key={reflection.id}>
          <CardContent className="p-4">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              {reflection.timestamp && (
                <>
                  <span className="font-medium">{reflection.timestamp}</span>
                  <span className="mx-2">•</span>
                </>
              )}
              <span>{formatDate(reflection.createdAt)}</span>
            </div>
            <p className="text-foreground">{reflection.text}</p>
            {reflection.tags && reflection.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {reflection.tags.map((tag: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 text-right">
              <Button variant="ghost" size="sm" className="text-primary">
                <i className="fas fa-brain mr-1"></i> Analyze this Note
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReflectionStream;
