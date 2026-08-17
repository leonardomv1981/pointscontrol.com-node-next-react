import { createRouter } from "next-connect";
import database from "infra/database.js";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const updatedAt = new Date().toISOString();
  const databaseName = process.env.POSTGRES_DB;
  let version = await database.query("SHOW server_version;");
  version = version.rows[0].server_version;
  let maxConnections = await database.query("SHOW max_connections;");
  maxConnections = maxConnections.rows[0].max_connections;
  let usedConnections = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  usedConnections = usedConnections.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: version,
        max_connections: parseInt(maxConnections),
        used_connections: usedConnections,
      },
    },
  });
}
