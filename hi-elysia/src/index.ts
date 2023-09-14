import { Elysia } from "elysia";

const app = new Elysia()
  .get("/search", ({ query }) => {
    console.log(query);
    return `Hello Elysia ${query.q}`;
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
