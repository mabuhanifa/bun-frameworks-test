import { Elysia, t } from "elysia";
import { prisma } from "./config/db";
import { log } from "console";

const PORT = Number(process.env.PORT) || 3000;

const app = new Elysia();

app.get("/search", () => {
  return `Hello from Elysia`;
});

app.post(
  "/user",
  async ({ body }) => {
    try {
      const { email, name } = body;

      const isExists = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (isExists?.email) {
        throw new Error("Email already exists");
      } else {
        const user = await prisma.user.create({
          data: {
            email,
            name,
          },
        });
        return user;
      }
    } catch (error) {
      throw new Error();
    }
  },
  {
    body: t.Object({
      name: t.String(),
      email: t.String(),
    }),
  }
);

app.get("/user", async () => {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    return error;
  }
});

app.listen(PORT, () => {
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
});
