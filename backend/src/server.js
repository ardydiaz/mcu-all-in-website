import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { logger } from "./helpers/logger.js";

const port = Number(process.env.PORT) || 3000;

try {
  const database = await connectDatabase();
  app.listen(port, () => {
    logger.info(`MCU All-in-One API running at http://localhost:${port}`);
    logger.info(`Database driver: ${database.driver}`);
  });
} catch (error) {
  logger.error("Unable to start the API.", error);
  process.exit(1);
}
