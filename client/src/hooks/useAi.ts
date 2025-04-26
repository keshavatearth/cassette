import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import * as api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Define interface for the recommendation response
interface Recommendation {
  title: string;
  type: string;
  reason: string;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  parsedSuccessfully: boolean;
}

interface InsightResponse {
  insight: string;
}

interface AnalysisResponse {
  sentiment: string;
  themes: string[];
  tags: string[];
}

export const useAi = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Get viewing insights (personalized analysis based on watch history)
  const {
    data: viewingInsights,
    isLoading: isLoadingInsights,
    error: insightsError,
    refetch: refetchInsights
  } = useQuery({
    queryKey: ['/api/ai/viewing-insights'],
    queryFn: async () => {
      const response = await api.getViewingInsights();
      const data = await response.json() as InsightResponse;
      return data.insight;
    },
    enabled: false, // Don't fetch on mount
  });

  // Generate content recommendations mutation
  const getRecommendationsMutation = useMutation({
    mutationFn: async ({ mood, timeAvailable }: { mood?: string; timeAvailable?: number }) => {
      setIsGenerating(true);
      const response = await api.getContentRecommendations(mood, timeAvailable);
      const data = await response.json() as RecommendationsResponse;
      return data;
    },
    onSuccess: () => {
      setIsGenerating(false);
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: 'Error getting recommendations',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Generate reflection insight mutation
  const getReflectionInsightMutation = useMutation({
    mutationFn: async ({ contentId, reflectionText }: { contentId: number; reflectionText: string }) => {
      setIsGenerating(true);
      const response = await api.getReflectionInsight(contentId, reflectionText);
      const data = await response.json() as InsightResponse;
      return data.insight;
    },
    onSuccess: () => {
      setIsGenerating(false);
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: 'Error generating reflection insight',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Analyze reflection for sentiment and tags mutation
  const analyzeReflectionMutation = useMutation({
    mutationFn: async (reflectionText: string) => {
      setIsGenerating(true);
      const response = await api.analyzeReflection(reflectionText);
      const data = await response.json() as AnalysisResponse;
      return data;
    },
    onSuccess: () => {
      setIsGenerating(false);
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: 'Error analyzing reflection',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return {
    // Viewing insights
    viewingInsights,
    isLoadingInsights,
    insightsError,
    refetchInsights,
    
    // Recommendations
    getRecommendations: getRecommendationsMutation.mutate,
    recommendations: getRecommendationsMutation.data?.recommendations,
    isLoadingRecommendations: getRecommendationsMutation.isPending,
    
    // Reflection insights
    getReflectionInsight: getReflectionInsightMutation.mutate,
    reflectionInsight: getReflectionInsightMutation.data,
    isLoadingReflectionInsight: getReflectionInsightMutation.isPending,
    
    // Reflection analysis
    analyzeReflection: analyzeReflectionMutation.mutate,
    reflectionAnalysis: analyzeReflectionMutation.data,
    isLoadingAnalysis: analyzeReflectionMutation.isPending,
    
    // General state
    isGenerating
  };
};