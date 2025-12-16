import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import type { WhitelistCheckResult } from "@shared/schema";
import { googleSheetsService } from "./google-sheets";

function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Not authenticated" });
}

// 🔥 Cooldown de 12 horas por Discord ID
const COOLDOWN_HOURS = 12;
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

// Guarda la última vez (timestamp) que cada usuario CONSUMIÓ un intento (start/timeout)
const lastAttemptById = new Map<string, number>();

// ✅ IDs desde ENV
const GUILD_ID = process.env.DISCORD_GUILD_ID as string;
const WL_ROLE_ID = process.env.DISCORD_WL_ROLE_ID as string;

if (!GUILD_ID || !WL_ROLE_ID) {
  throw new Error("DISCORD_GUILD_ID o DISCORD_WL_ROLE_ID no están configurados en las env vars");
}

// 👇 Revisar si el usuario YA tiene el rol WL
async function userHasWhitelistRole(user: any): Promise<boolean> {
  const accessToken = user?.accessToken as string | null;
  if (!accessToken) return false;

  try {
    const resp = await fetch(
      `https://discord.com/api/v10/users/@me/guilds/${GUILD_ID}/member`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (resp.status === 404) return false;
    if (!resp.ok) return false;

    const data: any = await resp.json();
    const roles: string[] = Array.isArray(data.roles) ? data.roles : [];
    return roles.includes(WL_ROLE_ID);
  } catch {
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // LOGIN
  app.get("/api/auth/discord", passport.authenticate("discord"));

  // CALLBACK
  app.get(
    "/api/auth/discord/callback",
    passport.authenticate("discord", { failureRedirect: "/?error=auth_failed" }),
    async (req: any, res) => {
      if (!req.user) return res.redirect("/?error=no_user");

      const userId = String(req.user.discordId);

      // ✅ Si ya tiene WL role
      const alreadyHasWL = await userHasWhitelistRole(req.user);
      if (alreadyHasWL) return res.redirect("/already-whitelisted");

      // ✅ Si está en cooldown
      const lastAttempt = lastAttemptById.get(userId);
      if (lastAttempt && Date.now() - lastAttempt < COOLDOWN_MS) {
        const msLeft = COOLDOWN_MS - (Date.now() - lastAttempt);
        const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));
        return res.redirect(`/cooldown?left=${hoursLeft}`);
      }

      // ✅ IMPORTANTÍSIMO: aquí NO marcamos intento.
      // El intento se marca cuando realmente abren el formulario (/api/whitelist/start)
      return res.redirect(`/instructions?f=1&id=${userId}`);
    }
  );

  // USER SESSION
  app.get("/api/auth/user", requireAuth, (req, res) => res.json(req.user));

  // LOGOUT
  app.post("/api/auth/logout", (req: any, res) => {
    req.logout((err: any) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      req.session.destroy((err2: any) => {
        if (err2) return res.status(500).json({ error: "Session destruction failed" });
        res.clearCookie("connect.sid");
        res.json({ success: true });
      });
    });
  });

  // ✅ Marcar el inicio real del intento (cuando abren el form)
  app.post("/api/whitelist/start", requireAuth, (req: any, res) => {
    const userId = String(req.user.discordId);
    lastAttemptById.set(userId, Date.now());
    return res.json({ ok: true, cooldownHours: COOLDOWN_HOURS });
  });

  // ✅ Timeout → fuerza cooldown
  app.post("/api/whitelist/timeout", requireAuth, (req: any, res) => {
    const userId = String(req.user.discordId);
    lastAttemptById.set(userId, Date.now());
    return res.json({ ok: true, leftHours: COOLDOWN_HOURS });
  });

  // DASHBOARD (si lo usás)
  app.get("/api/whitelist/check", requireAuth, async (req: any, res) => {
    try {
      const result: WhitelistCheckResult = await googleSheetsService.checkWhitelist(
        req.user.discordId,
        req.user.username,
        req.user.email || undefined
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: "Failed to check whitelist status",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
