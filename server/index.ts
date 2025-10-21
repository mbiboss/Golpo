import express from "express";
import { registerRoutes } from "./routes";

const app = express();
const PORT = 5000;

async function main() {
  const server = await registerRoutes(app);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
