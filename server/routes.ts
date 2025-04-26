import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertContentSchema,
  insertUserContentSchema,
  insertReflectionSchema,
  insertNotificationSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

// Extended Request type with user
interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string };
}

// Helper to check if user is authenticated
const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Configure session
  const MemoryStoreSession = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || "cassette-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure passport
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        // In a real app, we would hash and compare passwords
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        return done(null, { id: user.id, username: user.username });
      } catch (err) {
        return done(err);
      }
    }
  ));
  
  // Serialize/deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, { id: user.id, username: user.username });
    } catch (err) {
      done(err);
    }
  });
  
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // In a real app, we would hash the password
      const user = await storage.createUser(userData);
      
      // Login the user after signup
      req.login({ id: user.id, username: user.username }, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after signup" });
        }
        res.status(201).json({ id: user.id, username: user.username });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error during signup" });
    }
  });
  
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: req.user });
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", (req: AuthenticatedRequest, res) => {
    if (req.user) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  
  // Content routes
  app.get("/api/content", async (req, res) => {
    try {
      const allContent = await storage.getAllContent();
      res.json(allContent);
    } catch (error) {
      res.status(500).json({ message: "Error fetching content" });
    }
  });
  
  app.get("/api/content/:id", async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const content = await storage.getContent(contentId);
      
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Error fetching content" });
    }
  });
  
  app.post("/api/content", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const contentData = insertContentSchema.parse(req.body);
      
      // Check if content already exists
      const existingContent = await storage.getContentByTitle(contentData.title);
      if (existingContent) {
        return res.status(400).json({ message: "Content with this title already exists" });
      }
      
      const content = await storage.createContent(contentData);
      res.status(201).json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating content" });
    }
  });
  
  // User Content routes
  app.get("/api/user-content", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const userContent = await storage.getUserContentByUserId(userId);
      res.json(userContent);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user content" });
    }
  });
  
  app.get("/api/user-content/status/:status", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const status = req.params.status;
      
      if (!["watching", "watched", "watchlist"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const userContent = await storage.getUserContentByStatus(userId, status);
      res.json(userContent);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user content by status" });
    }
  });
  
  app.post("/api/user-content", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const userContentData = insertUserContentSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if content exists
      const content = await storage.getContent(userContentData.contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      // Check if user already has a relationship with this content
      const existingUserContent = await storage.getUserContentByContentId(userId, userContentData.contentId);
      if (existingUserContent) {
        // Update existing relationship
        const updated = await storage.updateUserContent(existingUserContent.id, userContentData);
        return res.json(updated);
      }
      
      // Create new relationship
      const userContent = await storage.createUserContent(userContentData);
      res.status(201).json(userContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating user content relationship" });
    }
  });
  
  app.patch("/api/user-content/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const userContentId = parseInt(req.params.id);
      
      // Get existing user content
      const userContent = Array.from((await storage.getUserContentByUserId(userId)))
        .find(item => item.id === userContentId);
        
      if (!userContent) {
        return res.status(404).json({ message: "User content relationship not found" });
      }
      
      // Update user content
      const updated = await storage.updateUserContent(userContentId, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating user content" });
    }
  });
  
  // Reflection routes
  app.get("/api/reflections", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const reflections = await storage.getReflectionsByUserId(userId);
      res.json(reflections);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reflections" });
    }
  });
  
  app.get("/api/reflections/content/:contentId", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const contentId = parseInt(req.params.contentId);
      
      // Check if content exists
      const content = await storage.getContent(contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      const reflections = await storage.getReflectionsByContentId(userId, contentId);
      res.json(reflections);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reflections by content" });
    }
  });
  
  app.post("/api/reflections", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const reflectionData = insertReflectionSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if content exists
      const content = await storage.getContent(reflectionData.contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      const reflection = await storage.createReflection(reflectionData);
      res.status(201).json(reflection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating reflection" });
    }
  });
  
  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });
  
  app.get("/api/notifications/count", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Error fetching notification count" });
    }
  });
  
  app.post("/api/notifications", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const notificationData = insertNotificationSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if content exists
      const content = await storage.getContent(notificationData.contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error creating notification" });
    }
  });
  
  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(notificationId);
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Error marking notification as read" });
    }
  });
  
  app.post("/api/notifications/read-all", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Error marking all notifications as read" });
    }
  });

  return httpServer;
}
