import database from "infra/database";
import email from "infra/email.js";
import webserver from "infra/webserver.js";

async function create(userId) {
  const expiresAt = new Date(Date.now() + 60 * 15 * 1000); // 15 minutes

  const newToken = await runInserQuery(userId, expiresAt);
  return newToken;

  async function runInserQuery(userId, expiresAt) {
    const results = await database.query({
      text: `INSERT INTO
        user_activation_tokens (user_id, expires_at)
      VALUES
        ($1, $2)
      RETURNING
        *
      ;`,
      values: [userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function findOneByUserId(userId) {
  const results = await database.query({
    text: `
      SELECT
        *
      FROM 
        user_activation_tokens
      WHERE
        user_id = $1
      LIMIT
        1
      ;`,
    values: [userId],
  });

  return results.rows[0];
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "PointsControl <pointscontrolapp@gmail.com>",
    to: user.email,
    subject: "Ative seu cadastro!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro no Points Control.
    
${webserver.origin}/cadastro/ativar/${activationToken.id}`,
  });
}

const activation = {
  create,
  findOneByUserId,
  sendEmailToUser,
};

export default activation;
