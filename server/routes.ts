import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, optionalAuth } from "./replitAuth";
import express from "express";
import crypto from "crypto";

// CSRF Protection Middleware - Double Submit Cookie Pattern
const csrfProtection: RequestHandler = (req, res, next) => {
  // Generate CSRF token if not present
  if (!req.cookies?.csrfToken) {
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false, // Must be readable by JavaScript
      secure: process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    });
    req.cookies = req.cookies || {};
    req.cookies.csrfToken = csrfToken;
  }
  next();
};

// CSRF Validation Middleware for state-changing operations
const validateCsrf: RequestHandler = (req, res, next) => {
  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.headers['x-csrf-token'] as string;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Cookie parser for CSRF tokens
  const cookieParser = require('cookie-parser');
  app.use(cookieParser());

  // Auth middleware
  await setupAuth(app);
  
  // CSRF protection for all routes
  app.use(csrfProtection);

  // Serve static files from the root directory
  app.use(express.static('.', {
    index: 'index.html',
    setHeaders: (res, path) => {
      // Disable caching to ensure updates are visible
      if (path.endsWith('.html') || path.endsWith('.js') || path.endsWith('.css')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));

  // Auth routes
  app.get('/api/auth/user', optionalAuth, async (req: any, res) => {
    try {
      if (!req.user || !req.user.claims) {
        return res.json(null);
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user || null);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Comments API routes
  
  // Get comments for a story (public)
  app.get("/api/comments/:storyId", async (req, res) => {
    try {
      const { storyId } = req.params;
      const commentsData = await storage.getCommentsByStory(storyId);
      res.json(commentsData);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create a comment (protected + CSRF validation)
  app.post("/api/comments", isAuthenticated, validateCsrf, express.json(), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { storyId, content } = req.body;

      if (!storyId || !content || content.trim().length === 0) {
        return res.status(400).json({ message: "Story ID and content are required" });
      }

      const comment = await storage.createComment({
        storyId,
        userId,
        content: content.trim(),
      });

      // Fetch the user data to return with the comment
      const user = await storage.getUser(userId);
      res.json({ ...comment, user });
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Update a comment (protected + CSRF validation)
  app.put("/api/comments/:commentId", isAuthenticated, validateCsrf, express.json(), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { commentId } = req.params;
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Content is required" });
      }

      const commentWithUser = await storage.updateComment(commentId, userId, content.trim());
      
      if (!commentWithUser) {
        return res.status(404).json({ message: "Comment not found or unauthorized" });
      }

      // Return comment with user data for proper frontend rendering
      res.json(commentWithUser);
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  // Delete a comment (protected + CSRF validation)
  app.delete("/api/comments/:commentId", isAuthenticated, validateCsrf, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { commentId } = req.params;

      const deleted = await storage.deleteComment(commentId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Comment not found or unauthorized" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
