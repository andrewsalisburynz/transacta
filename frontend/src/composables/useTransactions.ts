/**
 * Transactions Composable
 */

import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const GET_TRANSACTIONS = gql`
  query GetTransactions($status: ClassificationStatus) {
    transactions(status: $status) {
      id
      date
      amount
      payee
      particulars
      reference
      tranType
      categoryId
      category {
        id
        name
        color
      }
      classificationStatus
      confidenceScore
      isAutoApproved
    }
  }
`;

const GET_TRANSACTIONS_REQUIRING_REVIEW = gql`
  query GetTransactionsRequiringReview {
    transactionsRequiringReview {
      id
      date
      amount
      payee
      particulars
      categoryId
      category {
        id
        name
      }
      classificationStatus
      confidenceScore
    }
  }
`;

const CLASSIFY_TRANSACTION = gql`
  mutation ClassifyTransaction($transactionId: ID!, $categoryId: ID!) {
    classifyTransaction(transactionId: $transactionId, categoryId: $categoryId) {
      id
      categoryId
      classificationStatus
    }
  }
`;

const GET_CLASSIFICATION_SUGGESTION = gql`
  mutation GetClassificationSuggestion($transactionId: ID!) {
    getClassificationSuggestion(transactionId: $transactionId) {
      transactionId
      suggestedCategoryId
      confidenceScore
      shouldAutoApprove
      explanation
    }
  }
`;

export function useTransactions() {
  const { result: transactionsResult, loading: transactionsLoading, refetch: refetchTransactions } = useQuery(GET_TRANSACTIONS);
  const { result: reviewResult, loading: reviewLoading, refetch: refetchReview } = useQuery(GET_TRANSACTIONS_REQUIRING_REVIEW);

  const { mutate: classifyTransaction, loading: classifyLoading } = useMutation(CLASSIFY_TRANSACTION);
  const { mutate: getSuggestion, loading: suggestionLoading } = useMutation(GET_CLASSIFICATION_SUGGESTION);

  return {
    transactions: transactionsResult,
    transactionsLoading,
    refetchTransactions,
    reviewTransactions: reviewResult,
    reviewLoading,
    refetchReview,
    classifyTransaction,
    classifyLoading,
    getSuggestion,
    suggestionLoading
  };
}
