import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { googleSheetsService } from "./google-sheets";
import type { WhitelistCheckResult } from "@shared/schema";

function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated?.()) return next();
  return res.status(401).json({ error: "Not authenticated" });
}

// 🔥 Cooldown de 12 horas por Discord ID
const COOLDOWN_HOURS = 12;
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

// Guarda la última vez (timestamp) que cada usuario intentó WL
const lastAttemptById = new Map<string, number>();

// ✅ Anti “doble callback” (Discord a veces pega 2 veces el callback)
const lastCallbackHitById = new Map<string, number>();
const CALLBACK_GUARD_MS = 15_000;

// ✅ IDs de tu servidor y rol de whitelist en Discord DESDE ENV
const GUILD_ID = process.env.DISCORD_GUILD_ID as string;
const WL_ROLE_ID = process.env.DISCORD_WL_ROLE_ID as string;

if (!GUILD_ID || !WL_ROLE_ID) {
  throw new Error(
    "DISCORD_GUILD_ID o DISCORD_WL_ROLE_ID no están configurados en las env vars"
  );
}

async function userHasWhitelistRole(user: any): Promise<boolean> {
  const accessToken = user?.accessToken as string | null;
  if (!accessToken) {
    console.warn("⚠️ No hay accessToken en req.user, no se puede comprobar rol WL");
    return false;
  }

  try {
    const resp = await fetch(
      `https://discord.com/api/v10/users/@me/guilds/${GUILD_ID}/member`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (resp.status === 404) return false;

    if (!resp.ok) {
      console.error("Error al obtener member desde Discord:", resp.status, await resp.text());
      return false;
    }

    const data: any = await resp.json();
    const roles: string[] = Array.isArray(data.roles) ? data.roles : [];
    console.log("Roles del usuario:", roles);

    return roles.includes(WL_ROLE_ID);
  } catch (err) {
    console.error("Error llamando a la API de Discord para roles:", err);
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // LOGIN DISCORD
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

      // ✅ 0) Anti doble-callback: si entra 2 veces en <15s, NO apliques cooldown ni setees intento
      const lastHit = lastCallbackHitById.get(userId);
      if (lastHit && now - lastHit < CALLBACK_GUARD_MS) {
        console.log(`🧯 Doble callback detectado para ${userId}. Ignorando hit extra.`);
        // mandalo directo al form como si fuera el primero
        return res.redirect(`/auth/callback?f=1&id=${userId}`);
      }
      lastCallbackHitById.set(userId, now);

      // 1) Si YA tiene el rol → already-whitelisted
      const alreadyHasWL = await userHasWhitelistRole(req.user);
      if (alreadyHasWL) {
        console.log(`✅ Usuario ${userId} ya tiene rol de WL, redirigiendo a /already-whitelisted`);
        return res.redirect("/already-whitelisted");
      }

      // 2) Cooldown 12 horas
      const lastAttempt = lastAttemptById.get(userId);
      if (lastAttempt && now - lastAttempt < COOLDOWN_MS) {
        const msLeft = COOLDOWN_MS - (now - lastAttempt);
        const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));
        console.log(`⛔ Usuario ${userId} en cooldown. Horas restantes aproximadas: ${hoursLeft}`);
        return res.redirect(`/cooldown?left=${hoursLeft}`);
      }

      // 3) Registrar intento (solo si NO estaba en cooldown)
      lastAttemptById.set(userId, now);

      // 4) Formulario fijo delictivo
      console.log("Formulario seleccionado (delictivo): 1 Usuario:", userId);
      return res.redirect(`/auth/callback?f=1&id=${userId}`);
    }
  );

  // USER SESSION
  app.get("/api/auth/user", requireAuth, (req, res) => res.json(req.user));

  // LOGOUT
  app.post("/api/auth/logout", (req: any, res) => {
    req.logout((err: any) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      req.session.destroy((err: any) => {
        if (err) return res.status(500).json({ error: "Session destruction failed" });
        res.clearCookie("connect.sid");
        res.json({ success: true });
      });
    });
  });

  // WHITELIST CHECK
  app.get("/api/whitelist/check", requireAuth, async (req: any, res) => {
    try {
      const result: WhitelistCheckResult = await googleSheetsService.checkWhitelist(
        req.user.discordId,
        req.user.username,
        req.user.email || undefined
      );
      res.json(result);
    } catch (error) {
      console.error("Error checking whitelist:", error);
      res.status(500).json({
        error: "Failed to check whitelist status",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // ✅ timeout → fuerza cooldown (requiere sesión válida)
  app.post("/api/whitelist/timeout", requireAuth, (req: any, res) => {
    const userId = String(req.user.discordId);
    const now = Date.now();

    lastAttemptById.set(userId, now);

    console.log(`⛔ Timeout de whitelist para ${userId}. Cooldown aplicado ${COOLDOWN_HOURS}h.`);
    return res.json({ ok: true, leftHours: COOLDOWN_HOURS });
  });

  const httpServer = createServer(app);
  return httpServer;
}
