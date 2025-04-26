import { Request, Response } from "express";
import { 
  generateReflectionInsight, 
  generateContentRecommendations, 
  analyzeReflection, 
  generateViewingInsights 
} from "../utils/gemini";
import { storage } from "../storage";

interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string };
}

// Set up AI-related routes
export function setupAIRoutes(app: any) {
  // Generate insight based on a user's reflection
  app.post("/api/ai/reflection-insight", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { contentId, reflectionText } = req.body;
      
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (!contentId || !reflectionText) {
        return res.status(400).json({ message: "Content ID and reflection text are required" });
      }
      
      // Get content information
      const content = await storage.getContent(contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      // Generate insight
      const insight = await generateReflectionInsight(
        content.title,
        content.type,
        reflectionText
      );
      
      return res.status(200).json({ insight });
    } catch (error) {
      console.error("Error generating reflection insight:", error);
      return res.status(500).json({ message: "Error generating insight" });
    }
  });
  
  // Analyze a reflection to extract sentiment and tags
  app.post("/api/ai/analyze-reflection", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { reflectionText } = req.body;
      
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (!reflectionText) {
        return res.status(400).json({ message: "Reflection text is required" });
      }
      
      // Analyze reflection
      const analysis = await analyzeReflection(reflectionText);
      
      return res.status(200).json(analysis);
    } catch (error) {
      console.error("Error analyzing reflection:", error);
      return res.status(500).json({ message: "Error analyzing reflection" });
    }
  });
  
  // Get personalized content recommendations
  app.post("/api/ai/recommendations", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { mood, timeAvailable } = req.body;
      
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get user's content to determine preferences
      const userContent = await storage.getUserContentByUserId(req.user.id);
      
      // Extract content titles and genres
      const watchedContent = userContent
        .filter(item => item.status === "watched" || item.status === "watching")
        .map(item => item.content.title);
      
      // Extract all genres from user's content
      const allGenres = userContent.flatMap(item => item.content.genres || []);
      const preferredGenres = Array.from(new Set(allGenres)); // Remove duplicates
      
      // Generate recommendations
      const recommendationsStr = await generateContentRecommendations(
        watchedContent,
        preferredGenres,
        mood || '',
        timeAvailable || 0
      );
      
      // Try to parse the recommendations as JSON
      let recommendations;
      try {
        recommendations = JSON.parse(recommendationsStr);
      } catch (e) {
        // If parsing fails, just return the string
        return res.status(200).json({ 
          recommendations: recommendationsStr,
          parsedSuccessfully: false
        });
      }
      
      return res.status(200).json({ 
        recommendations,
        parsedSuccessfully: true
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return res.status(500).json({ message: "Error generating recommendations" });
    }
  });
  
  // Get personalized viewing insights
  app.get("/api/ai/viewing-insights", async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get user's recently watched content
      const userContent = await storage.getUserContentByUserId(req.user.id);
      const recentlyWatched = userContent
        .filter(item => item.status === "watched" || item.status === "watching")
        .slice(0, 5)  // Get up to 5 most recent
        .map(item => item.content.title);
      
      // Get user's recent reflections
      const reflections = await storage.getReflectionsByUserId(req.user.id);
      const reflectionHighlights = reflections
        .slice(0, 3)  // Get up to 3 most recent
        .map(reflection => reflection.text);
      
      // Generate insights
      const insights = await generateViewingInsights(
        recentlyWatched,
        reflectionHighlights
      );
      
      return res.status(200).json({ insights });
    } catch (error) {
      console.error("Error generating viewing insights:", error);
      return res.status(500).json({ message: "Error generating viewing insights" });
    }
  });
}