import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ReflectionForm from "@/components/entries/ReflectionForm";
import ReflectionStream from "@/components/entries/ReflectionStream";
import ContentInfo from "@/components/entries/ContentInfo";

interface EntryPageProps {
  slug: string;
}

const EntryPage = ({ slug }: EntryPageProps) => {
  const [_, setLocation] = useLocation();
  const contentId = parseInt(slug);
  
  // Get content details
  const { data: content, isLoading, error } = useQuery({
    queryKey: [`/api/content/${contentId}`],
  });
  
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-muted rounded mb-6"></div>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }
  
  if (error || !content) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <i className="fas fa-arrow-left mr-2"></i> Back to Home
          </Button>
        </div>
        <div className="text-center py-8 text-destructive">
          Content not found or error loading content.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Link href="/">
            <a className="text-primary hover:text-primary/90">
              <i className="fas fa-arrow-left"></i>
            </a>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">{content.title} - Reflections</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Reflection Area (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reflection Input Area */}
          <ReflectionForm contentId={contentId} />
          
          {/* Reflection Feed */}
          <ReflectionStream contentId={contentId} />
        </div>
        
        {/* Sidebar (1/3 width on large screens) */}
        <div className="space-y-6">
          {/* Content Info */}
          <ContentInfo contentId={contentId} />
        </div>
      </div>
    </div>
  );
};

export default EntryPage;
