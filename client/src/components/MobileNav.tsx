import { Link, useLocation } from "wouter";

const MobileNav = () => {
  const [location] = useLocation();
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around">
      <Link href="/">
        <a className={`flex flex-col items-center py-3 px-4 ${
          location === "/" ? "text-primary" : "text-muted-foreground"
        }`}>
          <i className="fas fa-home text-lg"></i>
          <span className="text-xs mt-1">Home</span>
        </a>
      </Link>
      <Link href="/library">
        <a className={`flex flex-col items-center py-3 px-4 ${
          location === "/library" ? "text-primary" : "text-muted-foreground"
        }`}>
          <i className="fas fa-book-open text-lg"></i>
          <span className="text-xs mt-1">Library</span>
        </a>
      </Link>
      <Link href="/reflections">
        <a className={`flex flex-col items-center py-3 px-4 ${
          location === "/reflections" ? "text-primary" : "text-muted-foreground"
        }`}>
          <i className="fas fa-comment-dots text-lg"></i>
          <span className="text-xs mt-1">Reflections</span>
        </a>
      </Link>
      <Link href="/discover">
        <a className={`flex flex-col items-center py-3 px-4 ${
          location === "/discover" ? "text-primary" : "text-muted-foreground"
        }`}>
          <i className="fas fa-compass text-lg"></i>
          <span className="text-xs mt-1">Discover</span>
        </a>
      </Link>
    </nav>
  );
};

export default MobileNav;
