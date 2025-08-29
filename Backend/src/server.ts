import app from "./app";
import env from "./config/env.config";
import logger from "./config/logger.config";

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});
