import app from "./app";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log("\n==================================================");
      console.log(`🚀 SAYF API Server (Stateless) running on http://localhost:${PORT}`);
      console.log("==================================================\n");
    }).on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.error(`🔴 [Server Startup Error] Port ${PORT} is already in use. Please stop any process using port ${PORT} and try again.`);
        process.exit(1);
      } else {
        console.error("🔴 [Server Startup Error]", err);
      }
    });
  } catch (error) {
    console.error("🔴 Fatal Server Startup Error:", error);
    process.exit(1);
  }
}

// Only start the server locally. Vercel will use the exported app directly.
if (!process.env.VERCEL) {
  startServer();
}

export default app;
