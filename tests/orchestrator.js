import retry from "async-retry";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPages, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPages() {
      const response = await fetch("http://localhost:3000/api/v1/migrations");
      if (response.status !== 200) {
        throw new Error();
      }
    }
  }
}

export default { waitForAllServices };
