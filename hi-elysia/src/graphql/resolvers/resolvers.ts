import { games } from "../../db/_db";

export const resolvers = {
  Query: {
    hi: () => "Hello from Elysia",
    games: () => games,
  },
};
