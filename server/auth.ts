import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, InsertUser } from "@shared/schema";

// This avoids redefining the User type which was causing a recursion error
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      password: string;
      isAdmin: boolean;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    // First, check if the stored password is in the correct format (contains a dot)
    if (!stored.includes('.')) {
      console.log('Stored password is not in the correct hashed format');
      // If it's a plain text password (from initial setup), do a simple comparison
      // This is a fallback for the first login after server setup
      return supplied === stored;
    }
    
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    // In case of an error, return false to fail the login safely
    return false;
  }
}

// Ensure admin user exists with proper credentials
export async function ensureAdminUser() {
  try {
    // Check if admin user exists
    const adminUser = await storage.getUserByUsername("admin");
    
    if (!adminUser) {
      // Create admin user with hashed password
      console.log("Creating admin user...");
      const hashedPassword = await hashPassword("admin");
      await storage.createUser({
        username: "admin",
        password: hashedPassword,
        isAdmin: true
      });
      console.log("Admin user created successfully");
    } else {
      // If admin exists but password isn't hashed (doesn't contain a dot)
      if (!adminUser.password.includes('.')) {
        console.log("Fixing admin password hash...");
        const hashedPassword = await hashPassword("admin");
        
        // We don't have an updateUser method, so we'll hack it by directly modifying the map
        // This is not ideal but necessary given the current implementation
        adminUser.password = hashedPassword;
        console.log("Admin password fixed");
      }
    }
  } catch (error) {
    console.error("Error ensuring admin user exists:", error);
  }
}

export async function setupAuth(app: Express) {
  // Ensure admin user with proper credentials exists
  await ensureAdminUser();
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "neonpulse-cyberpunk-blog-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Login attempt for username: ${username}`);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log(`User not found: ${username}`);
          return done(null, false);
        }
        
        console.log(`User found, comparing passwords. Password format: ${user.password.includes('.') ? 'hashed' : 'plaintext'}`);
        const passwordMatches = await comparePasswords(password, user.password);
        
        if (!passwordMatches) {
          console.log('Password verification failed');
          return done(null, false);
        } else {
          console.log('Login successful');
          return done(null, user);
        }
      } catch (err) {
        console.error('Login error:', err);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        isAdmin: false // Only manually set users to admin
      });
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Don't send password back to client
    const { password, ...userWithoutPassword } = req.user as User;
    res.status(200).json(userWithoutPassword);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Don't send password back to client
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });
  
  // Admin check middleware
  app.use("/api/admin/*", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = req.user as User;
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Forbidden - Admin access required" });
    }
    
    next();
  });
}
