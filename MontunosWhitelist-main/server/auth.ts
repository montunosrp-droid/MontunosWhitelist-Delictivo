import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import type { Express } from "express";
import { storage } from "./storage";
import type { InsertUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: string;
      discordId: string;
      username: string;
      discriminator: string | null;
      avatar: string | null;
      email: string | null;
      accessToken: string | null;
      refreshToken: string | null;
      createdAt: Date;
    }
  }
}

export function setupAuth(app: Express) {
  const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI,
  } = process.env;

  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI) {
    throw new Error("Discord OAuth credentials not configured");
  }

  passport.use(
    new DiscordStrategy(
      {
        clientID: DISCORD_CLIENT_ID,
        clientSecret: DISCORD_CLIENT_SECRET,
        callbackURL: DISCORD_REDIRECT_URI,

        // ✅ permisos para poder leer roles del guild
        scope: ["identify", "email", "guilds.members.read"],

        // ✅ ayudan a evitar flows raros/dobles
        state: true,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (err: any, user?: any) => void
      ) => {
        try {
          let user = await storage.getUserByDiscordId(profile.id);

          const userData: InsertUser = {
            discordId: profile.id,
            username: profile.username,
            discriminator: profile.discriminator ?? null,
            avatar: profile.avatar ?? null,
            email: profile.email ?? null,

            // ✅ guardamos tokens siempre que existan
            accessToken: accessToken ?? null,
            refreshToken: refreshToken ?? null,
          };

          if (user) user = await storage.updateUser(user.id, userData);
          else user = await storage.createUser(userData);

          if (!user) return done(new Error("Failed to create or update user"));

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || null);
    } catch (error) {
      done(error);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());
}
