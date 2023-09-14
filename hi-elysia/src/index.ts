import { Elysia, t } from "elysia";
import { prisma } from "./config/db";

const PORT = Number(process.env.PORT || 3000);

const app = new Elysia();

app.get("/search", () => {
  return `Hello from Elysia`;
});

const userSchema = t.Object({
  email: t.String(),
  name: t.String(),
});

app.post(
  "/user",
  async ({ body }) => {
    try {
      const { email, name } = body; // Destructure email and name from body
      const user = await prisma.user.create({
        data: {
          email,
          name,
        },
      });
      return user;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  {
    body: t.Object({
      name: t.String(),
      email: t.String(),
    }),
  }
);

app.listen(PORT, () => {
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
});
