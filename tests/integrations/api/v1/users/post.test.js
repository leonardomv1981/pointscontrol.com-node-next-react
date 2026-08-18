import orchestrator from "tests/orchestrator.js";
import database from "infra/database.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("anonymous user", () => {
    test("With unique and valida data", async () => {
      await database.query({
        text: "INSERT INTO users (username, email, password) values ($1, $2, $3);",
        values: ["leoVilela", "leo@leonardo.com", "senha123"],
      });

      const users = await database.query("SELECT * FROM users");
      console.log(users.rows);

      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
      });
      expect(response.status).toBe(201);
    });
  });
});
