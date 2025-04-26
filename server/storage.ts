import {
  users, User, InsertUser,
  content, Content, InsertContent,
  userContent, UserContent, InsertUserContent,
  reflections, Reflection, InsertReflection,
  notifications, Notification, InsertNotification
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Content operations
  getAllContent(): Promise<Content[]>;
  getContent(id: number): Promise<Content | undefined>;
  getContentByTitle(title: string): Promise<Content | undefined>;
  createContent(content: InsertContent): Promise<Content>;
  
  // UserContent operations
  getUserContentByUserId(userId: number): Promise<(UserContent & { content: Content })[]>;
  getUserContentByStatus(userId: number, status: string): Promise<(UserContent & { content: Content })[]>;
  getUserContentByContentId(userId: number, contentId: number): Promise<UserContent | undefined>;
  createUserContent(userContent: InsertUserContent): Promise<UserContent>;
  updateUserContent(id: number, userContent: Partial<UserContent>): Promise<UserContent>;
  
  // Reflection operations
  getReflectionsByUserId(userId: number): Promise<(Reflection & { content: Content })[]>;
  getReflectionsByContentId(userId: number, contentId: number): Promise<Reflection[]>;
  createReflection(reflection: InsertReflection): Promise<Reflection>;
  
  // Notification operations
  getNotificationsByUserId(userId: number): Promise<(Notification & { content: Content })[]>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private content: Map<number, Content>;
  private userContent: Map<number, UserContent>;
  private reflections: Map<number, Reflection>;
  private notifications: Map<number, Notification>;
  
  private userIdCounter: number;
  private contentIdCounter: number;
  private userContentIdCounter: number;
  private reflectionIdCounter: number;
  private notificationIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.content = new Map();
    this.userContent = new Map();
    this.reflections = new Map();
    this.notifications = new Map();
    
    this.userIdCounter = 1;
    this.contentIdCounter = 1;
    this.userContentIdCounter = 1;
    this.reflectionIdCounter = 1;
    this.notificationIdCounter = 1;
    
    // Add some sample content for testing
    this.initializeContent();
  }
  
  // Initialize some sample content
  private initializeContent() {
    const sampleContent: InsertContent[] = [
      {
        title: "Stranger Things",
        type: "tv",
        year: 2016,
        posterUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=800&h=450",
        synopsis: "When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces in order to get him back.",
        genres: ["Sci-Fi", "Horror", "Drama", "Mystery"],
        cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder", "David Harbour"],
        seasons: 4,
        episodes: 32
      },
      {
        title: "Succession",
        type: "tv",
        year: 2018,
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&h=450",
        synopsis: "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down from the company.",
        genres: ["Drama", "Comedy"],
        cast: ["Brian Cox", "Jeremy Strong", "Sarah Snook", "Kieran Culkin"],
        seasons: 3,
        episodes: 29
      },
      {
        title: "Dune",
        type: "movie",
        year: 2021,
        posterUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800&h=450",
        synopsis: "Feature adaptation of Frank Herbert's science fiction novel, about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.",
        genres: ["Sci-Fi", "Adventure", "Drama"],
        cast: ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac", "Zendaya"],
        runtime: 155
      },
      {
        title: "The Queen's Gambit",
        type: "tv",
        year: 2020,
        posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&h=450",
        synopsis: "Orphaned at the tender age of nine, prodigious introvert Beth Harmon discovers and masters the game of chess in 1960s USA. But child stardom comes at a price.",
        genres: ["Drama"],
        cast: ["Anya Taylor-Joy", "Bill Camp", "Moses Ingram", "Marielle Heller"],
        seasons: 1,
        episodes: 7
      },
      {
        title: "Foundation",
        type: "tv",
        year: 2021,
        posterUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=800&h=450",
        synopsis: "A complex saga of humans scattered on planets throughout the galaxy all living under the rule of the Galactic Empire.",
        genres: ["Sci-Fi", "Drama"],
        cast: ["Jared Harris", "Lee Pace", "Lou Llobell", "Leah Harvey"],
        seasons: 1,
        episodes: 10
      },
      {
        title: "Arrival",
        type: "movie",
        year: 2016,
        posterUrl: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&w=800&h=450",
        synopsis: "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
        genres: ["Sci-Fi", "Drama", "Mystery"],
        cast: ["Amy Adams", "Jeremy Renner", "Forest Whitaker"],
        runtime: 116
      },
      {
        title: "Knives Out",
        type: "movie",
        year: 2019,
        posterUrl: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=800&h=450",
        synopsis: "A detective investigates the death of a patriarch of an eccentric, combative family.",
        genres: ["Mystery", "Comedy", "Drama", "Crime"],
        cast: ["Daniel Craig", "Chris Evans", "Ana de Armas", "Jamie Lee Curtis"],
        runtime: 130
      }
    ];

    sampleContent.forEach(item => {
      this.createContent(item);
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Content operations
  async getAllContent(): Promise<Content[]> {
    return Array.from(this.content.values());
  }
  
  async getContent(id: number): Promise<Content | undefined> {
    return this.content.get(id);
  }
  
  async getContentByTitle(title: string): Promise<Content | undefined> {
    return Array.from(this.content.values()).find(
      content => content.title.toLowerCase() === title.toLowerCase()
    );
  }
  
  async createContent(insertContent: InsertContent): Promise<Content> {
    const id = this.contentIdCounter++;
    const now = new Date();
    const newContent: Content = { ...insertContent, id, createdAt: now };
    this.content.set(id, newContent);
    return newContent;
  }
  
  // UserContent operations
  async getUserContentByUserId(userId: number): Promise<(UserContent & { content: Content })[]> {
    const userContentItems = Array.from(this.userContent.values())
      .filter(item => item.userId === userId);
      
    return userContentItems.map(item => {
      const contentItem = this.content.get(item.contentId);
      if (!contentItem) throw new Error(`Content with id ${item.contentId} not found`);
      return { ...item, content: contentItem };
    });
  }
  
  async getUserContentByStatus(userId: number, status: string): Promise<(UserContent & { content: Content })[]> {
    const userContentItems = Array.from(this.userContent.values())
      .filter(item => item.userId === userId && item.status === status);
      
    return userContentItems.map(item => {
      const contentItem = this.content.get(item.contentId);
      if (!contentItem) throw new Error(`Content with id ${item.contentId} not found`);
      return { ...item, content: contentItem };
    });
  }
  
  async getUserContentByContentId(userId: number, contentId: number): Promise<UserContent | undefined> {
    return Array.from(this.userContent.values()).find(
      item => item.userId === userId && item.contentId === contentId
    );
  }
  
  async createUserContent(insertUserContent: InsertUserContent): Promise<UserContent> {
    const id = this.userContentIdCounter++;
    const now = new Date();
    const userContent: UserContent = { ...insertUserContent, id, updatedAt: now };
    this.userContent.set(id, userContent);
    return userContent;
  }
  
  async updateUserContent(id: number, userContentUpdate: Partial<UserContent>): Promise<UserContent> {
    const existing = this.userContent.get(id);
    if (!existing) {
      throw new Error(`UserContent with id ${id} not found`);
    }
    
    const updated: UserContent = { ...existing, ...userContentUpdate, updatedAt: new Date() };
    this.userContent.set(id, updated);
    return updated;
  }
  
  // Reflection operations
  async getReflectionsByUserId(userId: number): Promise<(Reflection & { content: Content })[]> {
    const userReflections = Array.from(this.reflections.values())
      .filter(reflection => reflection.userId === userId)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
    return userReflections.map(reflection => {
      const contentItem = this.content.get(reflection.contentId);
      if (!contentItem) throw new Error(`Content with id ${reflection.contentId} not found`);
      return { ...reflection, content: contentItem };
    });
  }
  
  async getReflectionsByContentId(userId: number, contentId: number): Promise<Reflection[]> {
    return Array.from(this.reflections.values())
      .filter(reflection => reflection.userId === userId && reflection.contentId === contentId)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }
  
  async createReflection(insertReflection: InsertReflection): Promise<Reflection> {
    const id = this.reflectionIdCounter++;
    const now = new Date();
    const reflection: Reflection = { ...insertReflection, id, createdAt: now };
    this.reflections.set(id, reflection);
    return reflection;
  }
  
  // Notification operations
  async getNotificationsByUserId(userId: number): Promise<(Notification & { content: Content })[]> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
    return userNotifications.map(notification => {
      const contentItem = this.content.get(notification.contentId);
      if (!contentItem) throw new Error(`Content with id ${notification.contentId} not found`);
      return { ...notification, content: contentItem };
    });
  }
  
  async getUnreadNotificationCount(userId: number): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.read)
      .length;
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const now = new Date();
    const notification: Notification = { ...insertNotification, id, createdAt: now };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new Error(`Notification with id ${id} not found`);
    }
    
    const updated = { ...notification, read: true };
    this.notifications.set(id, updated);
    return updated;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<void> {
    Array.from(this.notifications.entries())
      .filter(([_, notification]) => notification.userId === userId && !notification.read)
      .forEach(([id, notification]) => {
        this.notifications.set(id, { ...notification, read: true });
      });
  }
}

export const storage = new MemStorage();
