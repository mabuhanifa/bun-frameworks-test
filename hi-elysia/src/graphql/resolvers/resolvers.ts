import { prisma } from "../../config/db";
import { games } from "../../db/_db";

export const resolvers = {
  Query: {
    hi: () => "Hello from Elysia",
    games: () => games,
    users: () => {
      return prisma.user.findMany();
    },
  },
};
