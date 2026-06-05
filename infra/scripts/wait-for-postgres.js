const { exec } = require("node:child_process");
function checkDB() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkDB();
      return;
    }

    console.log("\n\n🟢 postgres is ready and accepting connections!\n");
  }
}

process.stdout.write("\n\n🔴 waiting for postgres to be ready...");
checkDB();
