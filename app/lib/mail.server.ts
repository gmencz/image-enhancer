import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import invariant from "tiny-invariant";
import * as jwt from "jsonwebtoken";
import { z } from "zod";

const { MAILERSEND_API_KEY } = process.env;
invariant(
  typeof MAILERSEND_API_KEY === "string",
  "MAILERSEND_API_KEY env var not set"
);

const mailerSend = new MailerSend({
  apiKey: MAILERSEND_API_KEY,
});

const sentFrom = new Sender("yo@gabrielmendezc.com", "Imxgic");

export async function sendSignInEmail(userId: number, email: string) {
  const { SIGN_IN_EMAIL_TOKEN_SECRET } = process.env;
  invariant(
    typeof SIGN_IN_EMAIL_TOKEN_SECRET === "string",
    "SIGN_IN_EMAIL_TOKEN_SECRET env var not set"
  );

  const token = await new Promise<string | undefined>((res, rej) => {
    jwt.sign(
      { userId },
      SIGN_IN_EMAIL_TOKEN_SECRET,
      { expiresIn: "10m" },
      (error, encoded) => {
        if (error) {
          return rej(error);
        }

        res(encoded);
      }
    );
  });

  if (!token) {
    throw new Error("jwt.sign() returned an empty token");
  }

  const recipients = [new Recipient(email)];

  const variables = [
    {
      email,
      substitutions: [
        {
          var: "support_email",
          value: "yo@gabrielmendezc.com",
        },
        {
          var: "token",
          value: token,
        },
      ],
    },
  ];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject("Sign in to Imxgic")
    .setTemplateId("pq3enl6x7v8l2vwr")
    .setVariables(variables);

  const { statusCode } = await mailerSend.email.send(emailParams);
  if (statusCode > 400) {
    throw new Error(
      `MailerSend failed to send email with status code ${statusCode}`
    );
  }
}

const tokenSchema = z.object({
  userId: z.number(),
});

export async function parseTokenFromEmail(token: string) {
  const { SIGN_IN_EMAIL_TOKEN_SECRET } = process.env;
  invariant(
    typeof SIGN_IN_EMAIL_TOKEN_SECRET === "string",
    "SIGN_IN_EMAIL_TOKEN_SECRET env var not set"
  );

  const tokenPayload = await new Promise<string | jwt.JwtPayload | undefined>(
    (res, rej) => {
      jwt.verify(token, SIGN_IN_EMAIL_TOKEN_SECRET, (error, payload) => {
        if (error) {
          return rej(error);
        }

        res(payload);
      });
    }
  );

  const { userId } = await tokenSchema.parseAsync(tokenPayload);
  return { userId };
}
