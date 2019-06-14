import { ApolloServer, gql } from 'apollo-server-express';
import express from 'express';
import { readFileSync } from 'fs';
import resolvers from './resolvers';

const schema = readFileSync(`${__dirname}/Schema/index.graphql`, { encoding: 'utf-8' });
const typeDefs = gql`${schema}`;


const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: { endpoint: '/api' },
});

const app = express();

server.applyMiddleware({ app, path: '/api' });

const port = process.env.PORT || 4000;

app.listen({ port }, () => console.log(`🚀 Server ready at ${server.graphqlPath}`));

export default app;
