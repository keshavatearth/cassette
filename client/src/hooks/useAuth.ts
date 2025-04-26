import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const { data, isError, isFetching } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    refetchOnWindowFocus: false,
    enabled: true,
  });
  
  useEffect(() => {
    if (!isFetching) {
      setIsAuthenticated(!isError && !!data?.user);
      setIsLoading(false);
    }
  }, [data, isError, isFetching]);
  
  return {
    isLoading,
    isAuthenticated,
    user: data?.user
  };
};
