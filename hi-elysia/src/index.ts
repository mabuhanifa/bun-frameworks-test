import { Elysia } from "elysia";

const PORT = Number(process.env.PORT || 3000);

const app = new Elysia();

app.get("/search", ({ query }) => {
  console.log(query);
  return `Hello Elysia ${query.q}`;
});

app.listen(PORT, () => {
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
});
