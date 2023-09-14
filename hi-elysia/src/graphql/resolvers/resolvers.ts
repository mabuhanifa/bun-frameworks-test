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

    async removeUser(_: any, args: { id: number }) {
      const deleted = await prisma.user.delete({
        where: {
          id: args.id,
        },
      });
      return deleted;
    },

    async updateUser(
      _: any,
      args: { data: { name: string; email: string; id: number } }
    ) {
      const { name, email, id } = args.data;

      const newUser = await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          email: email,
        },
      });

      return newUser;
    },
  },
};
