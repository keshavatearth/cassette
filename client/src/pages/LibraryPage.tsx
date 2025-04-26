import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LibraryPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  
  // Get all user content with content details
  const { data: userContent, isLoading, error } = useQuery({
    queryKey: ["/api/user-content"],
  });
  
  // Extract all unique genres from content
  const allGenres = userContent 
    ? [...new Set(userContent.flatMap((item: any) => item.content.genres))]
    : [];
  
  // Filter content based on selected genre
  const filterContentByGenre = (items: any[]) => {
    if (genreFilter === 'all') return items;
    return items.filter((item: any) => 
      item.content.genres.includes(genreFilter)
    );
  };
  
  // Get content by status
  const getContentByStatus = (status: string) => {
    if (!userContent) return [];
    return filterContentByGenre(
      userContent.filter((item: any) => item.status === status)
    );
  };
  
  const watching = getContentByStatus('watching');
  const watched = getContentByStatus('watched');
  const watchlist = getContentByStatus('watchlist');
  const allContent = filterContentByGenre(userContent || []);
  
  // Format progress text based on content type
  const getProgressText = (item: any) => {
    if (item.content.type === 'movie') {
      return `${item.progress || 0}m / ${item.content.runtime}m`;
    } else {
      return `Season ${item.currentSeason || 1}, Episode ${item.currentEpisode || 0} / Season ${item.content.seasons}`;
    }
  };
  
  // Calculate progress percentage
  const getProgressPercentage = (item: any) => {
    if (item.content.type === 'movie') {
      return ((item.progress || 0) / (item.content.runtime || 100)) * 100;
    } else {
      const totalEpisodes = item.content.seasons * (item.content.episodes || 10);
      const watchedEpisodes = (item.currentSeason - 1) * (item.content.episodes || 10) + item.currentEpisode;
      return (watchedEpisodes / totalEpisodes) * 100;
    }
  };
  
  // Render content based on view mode
  const renderContent = (items: any[]) => {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item: any) => (
            <Card key={item.id} className="overflow-hidden h-full">
              <div className="relative">
                <img 
                  src={item.content.posterUrl} 
                  alt={item.content.title} 
                  className="w-full h-40 object-cover"
                />
                {item.status === 'watching' && Math.random() > 0.7 && (
                  <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
                    {item.content.type === 'tv' ? 
                      (Math.random() > 0.5 ? '+ New Season!' : `+ ${Math.floor(Math.random() * 5) + 1} Episodes`) : 
                      undefined}
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold">{item.content.title}</h3>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span>{item.content.year} • {item.content.type === 'tv' ? 'TV Series' : 'Movie'}</span>
                </div>
                {item.status === 'watching' && (
                  <>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {getProgressText(item)}
                    </div>
                    <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full" 
                        style={{ width: `${getProgressPercentage(item)}%` }}
                      ></div>
                    </div>
                  </>
                )}
                <div className="mt-3">
                  <Link href={`/entry/${item.contentId}`}>
                    <a className="text-primary hover:text-primary/90 text-sm font-medium">
                      {item.status === 'watching' ? 'Continue Watching' : 'View Details'}
                    </a>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          {items.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="p-3">
                <div className="flex items-center">
                  <img 
                    src={item.content.posterUrl} 
                    alt={item.content.title} 
                    className="w-12 h-12 object-cover rounded-md mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{item.content.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                      <span>{item.content.year} • {item.content.type === 'tv' ? 'TV Series' : 'Movie'}</span>
                    </div>
                    {item.status === 'watching' && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {getProgressText(item)}
                      </div>
                    )}
                  </div>
                  <Link href={`/entry/${item.contentId}`}>
                    <a className="text-primary hover:text-primary/90 text-sm ml-2">
                      <i className="fas fa-arrow-right"></i>
                    </a>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Your Library</h1>
        <p className="text-muted-foreground mt-1">Manage your movies and TV shows</p>
      </div>
      
      {/* Filters and View Mode */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <div>
          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {allGenres.map((genre: string) => (
                <SelectItem key={genre} value={genre}>{genre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-foreground'}`}
          >
            <i className="fas fa-th-large"></i>
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-foreground'}`}
          >
            <i className="fas fa-list"></i>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="watching">Currently Watching</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="watched">Watched</TabsTrigger>
        </TabsList>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-40" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-3" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-destructive">Error loading your library. Please try again.</div>
        ) : (
          <>
            <TabsContent value="all">
              {allContent.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">Your library is empty.</p>
                  <Link href="/discover">
                    <a className="text-primary hover:text-primary/90 font-medium">Discover something to watch</a>
                  </Link>
                </Card>
              ) : (
                renderContent(allContent)
              )}
            </TabsContent>
            
            <TabsContent value="watching">
              {watching.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">You're not currently watching anything.</p>
                  <Link href="/discover">
                    <a className="text-primary hover:text-primary/90 font-medium">Discover something to watch</a>
                  </Link>
                </Card>
              ) : (
                renderContent(watching)
              )}
            </TabsContent>
            
            <TabsContent value="watchlist">
              {watchlist.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">Your watchlist is empty.</p>
                  <Link href="/discover">
                    <a className="text-primary hover:text-primary/90 font-medium">Discover something to watch</a>
                  </Link>
                </Card>
              ) : (
                renderContent(watchlist)
              )}
            </TabsContent>
            
            <TabsContent value="watched">
              {watched.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">You haven't marked anything as watched yet.</p>
                </Card>
              ) : (
                renderContent(watched)
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default LibraryPage;
