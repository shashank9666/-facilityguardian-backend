import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import compression from "compression";
import { connectDB } from "./config/database";
import { logger } from "./config/logger";
import { errorHandler, notFound } from "./middleware/errorHandler";

// Routes
import authRoutes        from "./routes/auth";
import assetRoutes       from "./routes/assets";
import workOrderRoutes   from "./routes/workOrders";
import vendorRoutes      from "./routes/vendors";
import incidentRoutes    from "./routes/incidents";
import inventoryRoutes   from "./routes/inventory";
import spaceRoutes       from "./routes/spaces";
import maintenanceRoutes from "./routes/maintenance";
import amcRoutes         from "./routes/amc";
import documentRoutes    from "./routes/documents";
import checklistRoutes   from "./routes/checklists";
import meterRoutes       from "./routes/meter-readings";

const app  = express();
const PORT = parseInt(process.env.PORT ?? "5000", 10);

// ── CORS (must be first — before rate limiters so preflight OPTIONS passes) ───
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(",").map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("*", cors()); // Handle preflight for all routes

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.disable("x-powered-by");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// Stricter rate limit on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many auth attempts, please try again later." },
});
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);

// ── Body parsing + Compression ────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan("combined", {
  stream: { write: (msg) => logger.http(msg.trim()) },
  skip: (req) => req.url === "/api/health",
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth",        authRoutes);
app.use("/api/assets",      assetRoutes);
app.use("/api/work-orders", workOrderRoutes);
app.use("/api/vendors",     vendorRoutes);
app.use("/api/incidents",   incidentRoutes);
app.use("/api/inventory",   inventoryRoutes);
app.use("/api/spaces",      spaceRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/amc",         amcRoutes);
app.use("/api/documents",   documentRoutes);
app.use("/api/checklists",  checklistRoutes);
app.use("/api/meter-readings", meterRoutes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`🚀 FMNexus API running on http://localhost:${PORT}`);
    logger.info(`   Environment: ${process.env.NODE_ENV ?? "development"}`);
  });
}

start().catch(err => {
  logger.error("Failed to start server", { err });
  process.exit(1);
});

export default app;
