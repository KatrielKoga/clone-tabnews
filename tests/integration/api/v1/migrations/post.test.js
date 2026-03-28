import orchestrator from "tests/orchestrator.js";
import webserver from "infra/webserver.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Running pending migrations", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action:
          'Verifique se o seu usuário possui a feature "create:migration"',
        message: "Você não possui permissão para executar esta ação.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });
  describe("Default user", () => {
    test("Running pending migrations", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      const userSession = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
        headers: {
          Cookie: `session_id=${userSession.token}`,
        },
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action:
          'Verifique se o seu usuário possui a feature "create:migration"',
        message: "Você não possui permissão para executar esta ação.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });

  describe("Privileged user", () => {
    describe("Running pending migrations with `create:migration`", () => {
      test("With `create:migration` feature", async () => {
        const privilegedUser = await orchestrator.createUser();
        const activatedPrivilegedUser =
          await orchestrator.activateUser(privilegedUser);
        await orchestrator.addFeaturesToUser(activatedPrivilegedUser, [
          "create:migration",
        ]);
        const privilegedUserSession = await orchestrator.createSession(
          activatedPrivilegedUser.id,
        );

        const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
          method: "POST",
          headers: {
            Cookie: `session_id=${privilegedUserSession.token}`,
          },
        });

        expect(response.status).toBe(200);

        const response1Body = await response.json();

        expect(Array.isArray(response1Body)).toBe(true);
      });
    });
  });
});
