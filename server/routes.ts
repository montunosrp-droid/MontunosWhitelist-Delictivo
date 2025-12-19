import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { googleSheetsService } from "./google-sheets";
import type { WhitelistCheckResult } from "@shared/schema";

function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Not authenticated" });
}

/**
 * =========================
 * Helpers
 * =========================
 */

async function fetchGuildMemberRoles(user: any): Promise<string[]> {
  const accessToken = user?.accessToken;
  if (!accessToken) return [];

  try {
    const resp = await fetch(
      `https://discord.com/api/v10/users/@me/guilds/${GUILD_ID}/member`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!resp.ok) return [];
    const data: any = await resp.json();
    return Array.isArray(data.roles) ? data.roles : [];
  } catch {
    return [];
  }
}

async function userHasRole(user: any, roleId: string): Promise<boolean> {
  if (!roleId) return false;
  const roles = await fetchGuildMemberRoles(user);
  return roles.includes(roleId);
}

// ⏱️ COOLDOWN
const COOLDOWN_HOURS = 12;
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

// Guarda intentos (cooldown) en memoria
const cooldownUntilById = new Map<string, number>(); // discordId -> expiresAt

// Guarda una sesión activa del formulario (evita timeout inmediato / doble llamada)
type ActiveWL = { startedAt: number; expiresAt: number };
const activeWhitelistById = new Map<string, ActiveWL>();

// Duración real del formulario (default 20 minutos si no configuras ENV)
const FORM_DURATION_MS = (() => {
  const raw = process.env.WL_FORM_DURATION_MS ?? process.env.WL_DURATION_MS;
  const n = raw ? Number(raw) : NaN;
  // default: 20 min
  return Number.isFinite(n) && n > 0 ? n : 20 * 60 * 1000;
})();

// ENV
const GUILD_ID = process.env.DISCORD_GUILD_ID as string;
const WL_ROLE_ID = process.env.DISCORD_WL_ROLE_ID as string;
// (OPCIONAL) Rol requerido para poder llenar este formulario (WL general)
const REQUIRED_GENERAL_WL_ROLE_ID = process.env.DISCORD_GENERAL_WL_ROLE_ID as
  | string
  | undefined;

if (!GUILD_ID || !WL_ROLE_ID) {
  throw new Error(
    "DISCORD_GUILD_ID o DISCORD_WL_ROLE_ID no están configurados"
  );
}

// 🔍 Revisa si ya tiene WL
async function userHasWhitelistRole(user: any): Promise<boolean> {
  return userHasRole(user, WL_ROLE_ID);
}

async function requireGeneralWhitelist(req: any, res: any, next: any) {
  // Si no configuraste el ENV, no bloqueamos nada.
  if (!REQUIRED_GENERAL_WL_ROLE_ID) return next();

  const ok = await userHasRole(req.user, REQUIRED_GENERAL_WL_ROLE_ID);
  if (!ok) {
    return res.status(403).json({
      ok: false,
      error: "missing_general_whitelist",
      message:
        "Necesitás tener la Whitelist General (rol requerido) antes de iniciar este formulario.",
    });
  }
  return next();
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

      const userId = String(
        req.user.discordId ?? req.user.discord_id ?? req.user.id ?? ""
      );

      if (!userId || userId === "undefined" || userId === "null") {
        return res.redirect("/?error=missing_id");
      }
      const now = Date.now();

      // ✅ Si ya tiene WL (delictiva)
      const alreadyHasWL = await userHasWhitelistRole(req.user);
      if (alreadyHasWL) {
        return res.redirect("/already-whitelisted");
      }

      // ⛔ Si requerís WL general y no la tiene
      if (REQUIRED_GENERAL_WL_ROLE_ID) {
        const hasGeneral = await userHasRole(
          req.user,
          REQUIRED_GENERAL_WL_ROLE_ID
        );
        if (!hasGeneral) {
          return res.redirect("/need-general-whitelist");
        }
      }

      // ⛔ Cooldown SOLO si ya hubo intento previo
      const until = cooldownUntilById.get(userId);
      if (until && now < until) {
        return res.redirect(`/cooldown?until=${until}`);
      }

      return res.redirect(`/auth/callback?f=1&id=${userId}`);
    }
  );

// 🟢 MARCAR INICIO REAL DE WL
app.post(
  "/api/whitelist/start",
  requireAuth,
  requireGeneralWhitelist,
  (req: any, res) => {
    const userId = String(req.user.discordId);
    const now = Date.now();

    // ✅ Si ya existe una sesión activa (doble request), reutilizarla
    const existing = activeWhitelistById.get(userId);
    if (existing && now < existing.expiresAt) {
      return res.json({ ok: true, expiresAt: existing.expiresAt, reused: true });
    }

    // ✅ Crear sesión activa (SIN activar cooldown aquí)
    const expiresAt = now + FORM_DURATION_MS;
    activeWhitelistById.set(userId, { startedAt: now, expiresAt });

    return res.json({ ok: true, expiresAt });
  }
);


  // ⛔ TIMEOUT (se acabó el tiempo)
  app.post("/api/whitelist/timeout", requireAuth, (req: any, res) => {
    const userId = String(req.user.discordId);
    const now = Date.now();

    const active = activeWhitelistById.get(userId);

    // ✅ Protección: si el front llama timeout de inmediato, NO lo castigamos
    if (!active) {
      return res.json({ ok: true, ignored: true, reason: "no_active_session" });
    }

    if (now < active.expiresAt) {
      return res.json({
        ok: true,
        ignored: true,
        reason: "not_expired_yet",
        msLeft: active.expiresAt - now,
      });
    }

    // Aquí sí expiró de verdad
    lastAttemptById.set(userId, now);
    activeWhitelistById.delete(userId);
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
