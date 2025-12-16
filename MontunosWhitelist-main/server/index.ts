import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { setupAuth } from "./auth";
import { registerRoutes } from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Render corre detrás de proxy (HTTPS).
// Sin esto, express-session NO setea cookies "secure" y Discord OAuth puede fallar
// o quedarse pegado en /api/auth/discord/callback.
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,

    // ✅ importante con proxies (Render)
    proxy: true,

    cookie: {
      httpOnly: true,
      // ✅ en Render siempre estás en https
      secure: process.env.NODE_ENV === "production",
      // ✅ OAuth redirect-friendly
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    },
  })
);

setupAuth(app);
await registerRoutes(app);

// Servir el build
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`serving on port ${PORT}`);
});
