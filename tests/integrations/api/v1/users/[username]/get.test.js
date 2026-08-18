import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import { password } from "pg/lib/defaults";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("anonymous user", () => {
    test("With exact case match", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "MesmoCase",
          email: "MesmoCase@gmail.com",
          password: "senha123",
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
      );

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "MesmoCase",
        email: "MesmoCase@gmail.com",
        password: "senha123",
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();

      // const response2Body = await response2.json();
      // expect(response2Body).toEqual({
      //   name: "ValidationError",
      //   message: "O e-mail informado já está sendo utilizado.",
      //   action: "Utilize outro e-mail para realizar o cadastro.",
      //   status_code: 400,
      // });
    });
    test("With exact case mismatch", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "CaseDiferente",
          email: "case.diferente@gmail.com",
          password: "senha123",
        }),
      });
      expect(response1.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/Casediferente",
      );

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "CaseDiferente",
        email: "case.diferente@gmail.com",
        password: "senha123",
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();

      // const response2Body = await response2.json();
      // expect(response2Body).toEqual({
      //   name: "ValidationError",
      //   message: "O e-mail informado já está sendo utilizado.",
      //   action: "Utilize outro e-mail para realizar o cadastro.",
      //   status_code: 400,
      // });
    });

    test("With non existant username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/usuarioInexistente",
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });

      // expect(uuidVersion(responseBody.id)).toBe(4);
      // expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      // expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // const responseBody = await response.json();
      // expect(responseBody).toEqual({
      //   name: "ValidationError",
      //   message: "O e-mail informado já está sendo utilizado.",
      //   action: "Utilize outro e-mail para realizar o cadastro.",
      //   status_code: 400,
      // });
    });
  });
});
