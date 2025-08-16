import "./config";
import express from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import serverlessHttp from "serverless-http";
import studentRouter from "./routes/student";
import publisherRouter from "./routes/publisher";
import authRouter from "./routes/auth";
import { authenticateToken, authorizeRoles } from "./middleware/auth.middleware";

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy configuration for both development and production
// Defaults to common private networks so reverse proxies (Docker, cloudflared, nginx) work safely
const trustProxyEnv = process.env.TRUST_PROXY?.trim();
let trustProxySetting: boolean | number | string =
  "loopback, linklocal, uniquelocal, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16";

if (trustProxyEnv) {
  if (trustProxyEnv === "true") {
    trustProxySetting = true;
  } else if (trustProxyEnv === "false") {
    trustProxySetting = false;
  } else if (!Number.isNaN(Number(trustProxyEnv))) {
    trustProxySetting = Number(trustProxyEnv);
  } else {
    trustProxySetting = trustProxyEnv; // Accept CSV of CIDRs or named ranges
  }
}
app.set("trust proxy", trustProxySetting);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Middleware
// In development, allow all origins (Expo web/devtools, native, tunnels)
if (process.env.NODE_ENV !== "production") {
  app.use(cors());
} else {
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const productionOrigins = [
        process.env.FRONTEND_URL || "http://localhost:3000",
      ];
      if (productionOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: [
      "Access-Control-Allow-Private-Network",
      "Access-Control-Allow-Origin",
    ],
  };
  app.use(cors(corsOptions));
}

// Load all the API routes
app.use(express.json());
app.use("/api/student", studentRouter);
app.use(
  "/api/publisher",
  authenticateToken,
  authorizeRoles(["publisher"]),
  publisherRouter
);
app.use("/api", authRouter);

// Start server
if (process.env.IS_LAMBDA == "false") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}

export const handler = serverlessHttp(app);
