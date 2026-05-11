test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  // console.log(responseBody);
  expect(responseBody.updated_at).toBeDefined();

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
  expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

  const version = responseBody.dependencies.database.version;
  expect(version).toEqual("16.13");

  expect(responseBody.dependencies.database.max_connections).toEqual(100);
  expect(responseBody.dependencies.database.used_connections).toEqual(1);

  // const usedConnections = responseBody.used_connections;
  // expect(usedConnections).toEqual(0);
});
