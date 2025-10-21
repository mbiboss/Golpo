import {
  users,
  comments,
  type User,
  type UpsertUser,
  type Comment,
  type NewComment,
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Comment operations
  getCommentsByStory(storyId: string): Promise<(Comment & { user: User })[]>;
  createComment(comment: NewComment): Promise<Comment>;
  deleteComment(commentId: string, userId: string): Promise<boolean>;
  updateComment(commentId: string, userId: string, content: string): Promise<Comment | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Comment operations
  async getCommentsByStory(storyId: string): Promise<(Comment & { user: User })[]> {
    const result = await db
      .select({
        comment: comments,
        user: users,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.storyId, storyId))
      .orderBy(desc(comments.createdAt));

    return result.map(r => ({
      ...r.comment,
      user: r.user!,
    }));
  }

  async createComment(commentData: NewComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(commentData)
      .returning();
    return comment;
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(comments)
      .where(and(
        eq(comments.id, commentId),
        eq(comments.userId, userId)
      ))
      .returning();
    return result.length > 0;
  }

  async updateComment(commentId: string, userId: string, content: string): Promise<(Comment & { user: User }) | undefined> {
    const [comment] = await db
      .update(comments)
      .set({ content, updatedAt: new Date() })
      .where(and(
        eq(comments.id, commentId),
        eq(comments.userId, userId)
      ))
      .returning();
    
    if (!comment) return undefined;
    
    // Fetch the associated user to return complete comment data
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    return {
      ...comment,
      user,
    };
  }
}

export const storage = new DatabaseStorage();
