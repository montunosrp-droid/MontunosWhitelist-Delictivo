import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { googleSheetsService } from "./google-sheets";
import type { WhitelistCheckResult } from "@shared/schema";

function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Not authenticated" });
}

// ⏱️ COOLDOWN
const COOLDOWN_HOURS = 12;
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

// Guarda intentos en memoria
const lastAttemptById = new Map<string, number>();

// ENV
const GUILD_ID = process.env.DISCORD_GUILD_ID as string;
const WL_ROLE_ID = process.env.DISCORD_WL_ROLE_ID as string;

if (!GUILD_ID || !WL_ROLE_ID) {
  throw new Error(
    "DISCORD_GUILD_ID o DISCORD_WL_ROLE_ID no están configurados"
  );
}

// 🔍 Revisa si ya tiene WL
async function userHasWhitelistRole(user: any): Promise<boolean> {
  const accessToken = user?.accessToken;
  if (!accessToken) return false;

  try {
    const resp = await fetch(
      `https://discord.com/api/v10/users/@me/guilds/${GUILD_ID}/member`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!resp.ok) return false;

    const data: any = await resp.json();
    return Array.isArray(data.roles) && data.roles.includes(WL_ROLE_ID);
  } catch {
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // LOGIN
  app.get("/api/auth/discord", passport.authenticate("discord"));

  // CALLBACK DISCORD
  app.get(
    "/api/auth/discord/callback",
    passport.authenticate("discord", {
      failureRedirect: "/?error=auth_failed",
    }),
    async (req: any, res) => {
      if (!req.user) return res.redirect("/?error=no_user");

      const userId = String(req.user.discordId);
      const now = Date.now();

      // ✅ Si ya tiene WL
      const alreadyHasWL = await userHasWhitelistRole(req.user);
      if (alreadyHasWL) {
        return res.redirect("/already-whitelisted");
      }

      // ⛔ Cooldown SOLO si ya hubo intento previo
      const lastAttempt = lastAttemptById.get(userId);
      if (lastAttempt && now - lastAttempt < COOLDOWN_MS) {
        const msLeft = COOLDOWN_MS - (now - lastAttempt);
        const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));
        return res.redirect(`/cooldown?left=${hoursLeft}`);
      }

      // ⚠️ NO marcamos intento todavía
      // Mandamos a instrucciones
      return res.redirect(`/instructions?f=1&id=${userId}`);
    }
  );

  // 🟢 MARCAR INICIO REAL DE WL
  app.post("/api/whitelist/start", requireAuth, (req: any, res) => {
    const userId = String(req.user.discordId);
    lastAttemptById.set(userId, Date.now());
    return res.json({ ok: true });
  });

  // ⛔ TIMEOUT (se acabó el tiempo)
  app.post("/api/whitelist/timeout", requireAuth, (req: any, res) => {
    const userId = String(req.user.discordId);
    lastAttemptById.set(userId, Date.now());
    return res.json({ ok: true });
  });

  // USER
  app.get("/api/auth/user", requireAuth, (req, res) => {
    res.json(req.user);
  });

  // LOGOUT
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ success: true });
      });
    });
  });

  // CHECK WL (dashboard)
  app.get("/api/whitelist/check", requireAuth, async (req, res) => {
    try {
      const result: WhitelistCheckResult =
        await googleSheetsService.checkWhitelist(
          req.user.discordId,
          req.user.username,
          req.user.email || undefined
        );
      res.json(result);
    } catch {
      res.status(500).json({ error: "Failed whitelist check" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
