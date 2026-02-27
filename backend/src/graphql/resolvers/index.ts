/**
 * GraphQL Resolvers Index
 */

import { GraphQLScalarType, Kind } from 'graphql';
import { queryResolvers } from './queries';
import { mutationResolvers } from './mutations';

// Custom scalar for Date (YYYY-MM-DD)
const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type (YYYY-MM-DD)',
  serialize(value: any) {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return value;
  },
  parseValue(value: any) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  }
});

// Custom scalar for DateTime (ISO 8601)
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type (ISO 8601)',
  serialize(value: any) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }
});

export const resolvers = {
  Date: DateScalar,
  DateTime: DateTimeScalar,
  Category: {
    categoryType: (parent: any) => {
      // Transform lowercase database value to uppercase GraphQL enum
      return parent.categoryType?.toUpperCase() || parent.category_type?.toUpperCase();
    }
  },
  Transaction: {
    classificationStatus: (parent: any) => {
      // Transform lowercase database value to uppercase GraphQL enum
      return parent.classificationStatus?.toUpperCase() || parent.classification_status?.toUpperCase();
    }
  },
  ...queryResolvers,
  ...mutationResolvers
};
