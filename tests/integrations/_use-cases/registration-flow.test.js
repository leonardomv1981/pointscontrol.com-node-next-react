import activation from "models/activation.js";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmail();
});

describe("Use case: registration Flow (all sucessful)", () => {
  let createUserREsponseBody;
  test("Create user account", async () => {
    const createdUserREsponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "registrationFlow",
          email: "registration.flow@dousuario.com",
          password: "RegistrationFlowPassword",
        }),
      },
    );

    expect(createdUserREsponse.status).toBe(201);
    createUserREsponseBody = await createdUserREsponse.json();

    expect(createUserREsponseBody).toEqual({
      id: createUserREsponseBody.id,
      username: "registrationFlow",
      email: "registration.flow@dousuario.com",
      features: ["read:activation_token"],
      password: createUserREsponseBody.password,
      created_at: createUserREsponseBody.created_at,
      updated_at: createUserREsponseBody.updated_at,
    });
  });

  test("Send activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    const activationToken = await activation.findOneByUserId(
      createUserREsponseBody.id,
    );
    expect(lastEmail.sender).toBe("<pointscontrolapp@gmail.com>");
    expect(lastEmail.recipients[0]).toBe("<registration.flow@dousuario.com>");
    expect(lastEmail.subject).toBe("Ative seu cadastro!");
    expect(lastEmail.text).toContain("registrationFlow");
    expect(lastEmail.text).toContain(activationToken.id);
  });

  test("Activate account", async () => {});

  test("Login", async () => {});
});
