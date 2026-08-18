import { runner as migrationRunner } from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve(process.cwd(), "infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
};

async function listingPendindMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    });
    console.log(pendingMigrations);
    return pendingMigrations;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });
    return migratedMigrations;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listingPendindMigrations,
  runPendingMigrations,
};

export default migrator;
