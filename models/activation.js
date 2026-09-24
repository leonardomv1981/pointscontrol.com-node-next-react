import database from "infra/database";
import email from "infra/email.js";
import { NotFoundError, UnauthorizedError } from "infra/errors";
import webserver from "infra/webserver.js";
import user from "models/user.js";

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

async function findAndUseToken(activationTokenId) {
  console.log("====== vai fazer query");
  const results = await database.query({
    text: `
    UPDATE
      user_activation_tokens
    SET
      used_at = NOW(),
      updated_at = NOW()
    WHERE
      id = $1
      AND 
      used_at IS NULL
      AND
      expires_at > NOW()
    RETURNING
      *
    ;`,
    values: [activationTokenId],
  });

  if (results.rowCount === 0) {
    throw new UnauthorizedError({
      message: "Token inválido",
    });
  }

  return results.rows[0];
}

async function findOneValidById(tokenId) {
  const results = await database.query({
    text: `
      SELECT
        *
      FROM 
        user_activation_tokens
      WHERE
        id = $1
        AND expires_at > NOW()
        AND used_at IS NULL
      LIMIT
        1
      ;`,
    values: [tokenId],
  });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: "O token de ativação utilizado não foi encontrado ou expirou",
      action: "Faça um novo cadastro",
    });
  }

  return results.rows[0];
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "PointsControl <pointscontrolapp@gmail.com>",
    to: user.email,
    subject: "Ative seu cadastro!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro no Points Control.
    
${webserver.origin}/activations/${activationToken.id}`,
  });
}

async function activateUserById(userId) {
  const activatedUser = await user.setFeature(userId, ["create:session"]);
  return activatedUser;
}

const activation = {
  create,
  findOneValidById,
  sendEmailToUser,
  findAndUseToken,
  activateUserById,
};

export default activation;
