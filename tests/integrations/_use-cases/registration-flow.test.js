import webserver from "infra/webserver";
import activation from "models/activation.js";
import user from "models/user";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmail();
});

describe("Use case: registration Flow (all sucessful)", () => {
  let createUserREsponseBody, activationTokenId;
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

    expect(lastEmail.sender).toBe("<pointscontrolapp@gmail.com>");
    expect(lastEmail.recipients[0]).toBe("<registration.flow@dousuario.com>");
    expect(lastEmail.subject).toBe("Ative seu cadastro!");
    expect(lastEmail.text).toContain("registrationFlow");

    activationTokenId = orchestrator.extractUUID(lastEmail.text);

    expect(lastEmail.text).toContain(
      `${webserver.origin}/activations/${activationTokenId}`,
    );

    const activationTokenObject =
      await activation.findOneValidById(activationTokenId);

    expect(activationTokenObject.user_id).toBe(createUserREsponseBody.id);
    expect(activationTokenObject.used_at).toBe(null);
  });

  test("Activate account", async () => {
    const activationResponse = await fetch(
      `${webserver.origin}/api/v1/activations/${activationTokenId}`,
      {
        method: "PATCH",
      },
    );

    expect(activationResponse.status).toBe(200);

    const activationResponseBody = await activationResponse.json();

    expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN();

    const activatedUser = await user.findOneByUsername("RegistrationFlow");
    expect(activatedUser.features).toEqual(["create:session"]);
  });

  test("Activate account already activated", async () => {
    const activationResponse = await fetch(
      `${webserver.origin}/api/v1/activations/${activationTokenId}`,
      {
        method: "PATCH",
      },
    );

    expect(activationResponse.status).toBe(401);
  });

  test("Login", async () => {});
});
