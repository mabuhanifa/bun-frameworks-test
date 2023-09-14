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
  Mutation: {
    async createUser(_: any, args: { data: { name: string; email: string } }) {
      const { name, email } = args.data;

      const newUser = await prisma.user.create({
        data: {
          name: name,
          email: email,
        },
      });
      return newUser;
    },
  },
};
