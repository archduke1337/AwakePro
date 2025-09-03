// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/services/openrouter.ts
var MODEL_MAPPINGS = {
  gpt: "openai/gpt-4o",
  claude: "anthropic/claude-3.5-sonnet",
  llama: "meta-llama/llama-3.1-70b-instruct"
};
var AVAILABLE_MODELS = Object.keys(MODEL_MAPPINGS);
var OpenRouterService = class {
  apiKey;
  baseUrl = "https://openrouter.ai/api/v1";
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    if (!this.apiKey) {
      console.error("OpenRouter API key not found. Available env vars:", {
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? "SET" : "NOT SET",
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL ? "YES" : "NO"
      });
      throw new Error("OpenRouter API key is required. Please check your environment variables.");
    }
    console.log("OpenRouter service initialized successfully");
  }
  async chat(message, model) {
    try {
      let selectedModel = model;
      if (model === "auto") {
        const randomIndex = Math.floor(Math.random() * AVAILABLE_MODELS.length);
        selectedModel = AVAILABLE_MODELS[randomIndex];
      }
      const openRouterModel = MODEL_MAPPINGS[selectedModel];
      if (!openRouterModel) {
        throw new Error(`Unsupported model: ${selectedModel}`);
      }
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000",
          "X-Title": "AWAKE Meta-AI OS"
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [
            {
              role: "user",
              content: message
            }
          ],
          max_tokens: 1e3,
          temperature: 0.7
        })
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
      }
      const data = await response.json();
      return {
        content: data.choices[0]?.message?.content || "No response generated",
        modelUsed: selectedModel
      };
    } catch (error) {
      console.error("OpenRouter API error:", error);
      throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

// server/routes.ts
import { randomUUID } from "crypto";
async function registerRoutes(app2) {
  let openRouterService;
  try {
    openRouterService = new OpenRouterService();
  } catch (error) {
    console.error("Failed to initialize OpenRouter service:", error);
    openRouterService = {
      chat: async () => ({
        content: "Service temporarily unavailable. Please check your API configuration.",
        modelUsed: "error"
      })
    };
  }
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
  });
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
  });
  function detectAutomations(message) {
    const automations = [];
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("email")) {
      automations.push({
        type: "email",
        message: "Action simulated: Email sent!",
        icon: "\u{1F4E7}"
      });
    }
    if (lowerMessage.includes("task")) {
      automations.push({
        type: "task",
        message: "Action simulated: Jira task created!",
        icon: "\u2705"
      });
    }
    if (lowerMessage.includes("slack")) {
      automations.push({
        type: "slack",
        message: "Action simulated: Slack message posted!",
        icon: "\u{1F4AC}"
      });
    }
    return automations;
  }
  app2.post("/api/chat", async (req, res) => {
    try {
      console.log("Chat request received:", {
        body: req.body,
        headers: req.headers,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      const { message, model } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }
      if (!model || !["auto", "gpt", "claude", "llama"].includes(model)) {
        return res.status(400).json({ error: "Valid model selection is required" });
      }
      console.log("Processing chat request:", { message, model });
      const { content, modelUsed } = await openRouterService.chat(message, model);
      const automations = detectAutomations(message);
      const response = {
        id: randomUUID(),
        content,
        model: modelUsed,
        automations
      };
      console.log("Chat response generated:", {
        modelUsed,
        contentLength: content.length,
        automationsCount: automations.length
      });
      res.json(response);
    } catch (error) {
      console.error("Chat API error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process chat request";
      res.status(500).json({
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error : void 0
      });
    }
  });
  app2.get("/api/health", (req, res) => {
    try {
      const healthStatus = {
        status: "ok",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        environment: process.env.NODE_ENV || "unknown",
        openRouterAvailable: openRouterService && typeof openRouterService.chat === "function",
        uptime: process.uptime()
      };
      res.json(healthStatus);
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({
        status: "error",
        error: "Health check failed",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app2.get("/api/test", (req, res) => {
    res.json({
      message: "Server is running!",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      env: process.env.NODE_ENV || "unknown"
    });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "CIRCULAR_DEPENDENCY") return;
        warn(warning);
      }
    }
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "..", "dist");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    console.log("Starting server...", {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? "YES" : "NO",
      PORT: process.env.PORT || "5000"
    });
    const server = await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Request error:", { status, message, error: err });
      res.status(status).json({ message });
    });
    if (app.get("env") === "development") {
      console.log("Setting up Vite for development...");
      await setupVite(app, server);
    } else {
      console.log("Setting up static file serving for production...");
      serveStatic(app);
    }
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true
    }, () => {
      log(`\u2705 Server started successfully on port ${port}`);
      console.log("Server environment:", {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL ? "YES" : "NO",
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? "SET" : "NOT SET"
      });
    });
  } catch (error) {
    console.error("\u274C Failed to start server:", error);
    process.exit(1);
  }
})();
