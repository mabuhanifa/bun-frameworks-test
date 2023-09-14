import { Elysia, t } from "elysia";
import { prisma } from "./config/db";
import { yoga } from "@elysiajs/graphql-yoga";

const PORT = Number(process.env.PORT) || 3000;

const app = new Elysia();

app.get("/", () => {
  return { message: `Hello from Elysia` };
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
        return new Error("Email already exists");
      } else {
        const user = await prisma.user.create({
          data: {
            email,
            name,
          },
        });
        return user;
      }
    } catch (error: any) {
      throw new Error(error);
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

app.use(
  yoga({
    typeDefs: /* GraphQL */ `
      type Query {
        hi: String
      }
    `,
    resolvers: {
      Query: {
        hi: () => "Hello from Elysia",
      },
    },
  })
);

app.listen(PORT, () => {
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
});
