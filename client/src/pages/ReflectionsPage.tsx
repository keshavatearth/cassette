import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ReflectionsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [titleFilter, setTitleFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");

  // Get all reflections
  const { data: reflections, isLoading, error } = useQuery({
    queryKey: ["/api/reflections"],
  });

  // Extract unique titles and tags for filter dropdowns
  const uniqueTitles = reflections 
    ? [...new Set(reflections.map((reflection: any) => reflection.content.title))]
    : [];
    
  const uniqueTags = reflections 
    ? [...new Set(reflections.flatMap((reflection: any) => reflection.tags || []))]
    : [];

  // Filter reflections based on search, title, and tag filters
  const filteredReflections = reflections
    ? reflections.filter((reflection: any) => {
        // Text search filter
        const matchesSearch = searchQuery 
          ? reflection.text.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        
        // Title filter
        const matchesTitle = titleFilter === "all" 
          ? true 
          : reflection.content.title === titleFilter;
        
        // Tag filter
        const matchesTag = tagFilter === "all" 
          ? true 
          : (reflection.tags || []).includes(tagFilter);
          
        return matchesSearch && matchesTitle && matchesTag;
      })
    : [];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">All Your Reflections</h1>
        <p className="text-muted-foreground mt-1">Browse and search through all your notes</p>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 space-y-4">
        <Input
          type="text"
          placeholder="Search in your reflections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        
        <div className="flex flex-wrap gap-4">
          <Select value={titleFilter} onValueChange={setTitleFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by title" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Titles</SelectItem>
              {uniqueTitles.map((title: string) => (
                <SelectItem key={title} value={title}>{title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {uniqueTags.map((tag: string) => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reflections List */}
      <div className="space-y-4">
        {isLoading ? (
          Array(5).fill(0).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <Skeleton className="h-5 w-32 mr-2" />
                  <Skeleton className="h-4 w-4 mx-2" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-4 mx-2" />
                  <Skeleton className="h-5 w-32 ml-auto" />
                </div>
                <Skeleton className="h-20 w-full mb-2" />
                <div className="flex flex-wrap gap-1 mb-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-32" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <div className="text-destructive">Error loading reflections. Please try again.</div>
        ) : filteredReflections.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              {searchQuery || titleFilter !== "all" || tagFilter !== "all"
                ? "No reflections match your filters."
                : "You haven't added any reflections yet."}
            </p>
          </Card>
        ) : (
          filteredReflections.map((reflection: any) => (
            <Card key={reflection.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-foreground">
                      {reflection.content.title}
                    </span>
                    {reflection.timestamp && (
                      <>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{reflection.timestamp}</span>
                      </>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(reflection.createdAt)}
                  </span>
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
                <div className="mt-2 flex justify-end">
                  <Link href={`/entry/${reflection.contentId}`}>
                    <a className="text-primary hover:text-primary/90 text-sm font-medium">
                      Go to {reflection.content.title}
                    </a>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReflectionsPage;
