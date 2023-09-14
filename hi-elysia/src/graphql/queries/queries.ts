export const typeDefs = /* GraphQL */ `
  type Game {
    id: String
    title: String
    platform: [String]
  }

  type User {
    id: Int
    name: String
    email: String
  }

  input UserInput {
    name: String!
    email: String!
  }

  type Query {
    hi: String
    games: [Game]
    users: [User]
  }

  type Mutation {
    createUser(data: UserInput!): User!
    removeUser(id: Int!): User
  }
`;
