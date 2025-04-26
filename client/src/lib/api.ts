import { apiRequest } from "./queryClient";

// Auth API
export const loginUser = (credentials: { username: string; password: string }) => {
  return apiRequest("POST", "/api/auth/login", credentials);
};

export const signupUser = (userData: { 
  username: string; 
  email: string; 
  password: string;
  displayName?: string;
}) => {
  return apiRequest("POST", "/api/auth/signup", userData);
};

export const logoutUser = () => {
  return apiRequest("POST", "/api/auth/logout");
};

export const getCurrentUser = () => {
  return apiRequest("GET", "/api/auth/me");
};

// Content API
export const getAllContent = () => {
  return apiRequest("GET", "/api/content");
};

export const getContentById = (id: number) => {
  return apiRequest("GET", `/api/content/${id}`);
};

export const createContent = (contentData: any) => {
  return apiRequest("POST", "/api/content", contentData);
};

// User Content API
export const getUserContent = () => {
  return apiRequest("GET", "/api/user-content");
};

export const getUserContentByStatus = (status: string) => {
  return apiRequest("GET", `/api/user-content/status/${status}`);
};

export const createUserContent = (userContentData: any) => {
  return apiRequest("POST", "/api/user-content", userContentData);
};

export const updateUserContent = (id: number, userContentData: any) => {
  return apiRequest("PATCH", `/api/user-content/${id}`, userContentData);
};

// Reflection API
export const getAllReflections = () => {
  return apiRequest("GET", "/api/reflections");
};

export const getReflectionsByContentId = (contentId: number) => {
  return apiRequest("GET", `/api/reflections/content/${contentId}`);
};

export const createReflection = (reflectionData: any) => {
  return apiRequest("POST", "/api/reflections", reflectionData);
};

// Notification API
export const getAllNotifications = () => {
  return apiRequest("GET", "/api/notifications");
};

export const getNotificationCount = () => {
  return apiRequest("GET", "/api/notifications/count");
};

export const markNotificationAsRead = (id: number) => {
  return apiRequest("PATCH", `/api/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = () => {
  return apiRequest("POST", "/api/notifications/read-all");
};

export const createNotification = (notificationData: any) => {
  return apiRequest("POST", "/api/notifications", notificationData);
};

// AI API
export const getReflectionInsight = (contentId: number, reflectionText: string) => {
  return apiRequest("POST", "/api/ai/reflection-insight", { contentId, reflectionText });
};

export const analyzeReflection = (reflectionText: string) => {
  return apiRequest("POST", "/api/ai/analyze-reflection", { reflectionText });
};

export const getContentRecommendations = (mood?: string, timeAvailable?: number) => {
  return apiRequest("POST", "/api/ai/recommendations", { mood, timeAvailable });
};

export const getViewingInsights = () => {
  return apiRequest("GET", "/api/ai/viewing-insights");
};
