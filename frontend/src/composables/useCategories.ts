/**
 * Categories Composable
 */

import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      description
      categoryType
      color
      transactionCount
      totalAmount
    }
  }
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      description
      categoryType
      color
    }
  }
`;

export function useCategories() {
  const { result: categoriesResult, loading: categoriesLoading, refetch: refetchCategories } = useQuery(GET_CATEGORIES);

  const { mutate: createCategory, loading: createLoading } = useMutation(CREATE_CATEGORY);

  return {
    categories: categoriesResult,
    categoriesLoading,
    refetchCategories,
    createCategory,
    createLoading
  };
}
