/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { GraphQLFormattedError } from 'graphql';
import { OriginalError } from '../interface';

export const formatError = (
  error: GraphQLFormattedError,
): GraphQLFormattedError => {
  // Safely get the originalError from extensions
  const originalError = error.extensions?.originalError as OriginalError;

  // If originalError doesn't exist, return the standard GraphQL error message
  if (!originalError) {
    return {
      message: error.message,
      extensions: {
        code: error.extensions?.code || 'INTERNAL_SERVER_ERROR', // Provide a default code
      },
    };
  }

  // Format the error with details from the custom OriginalError interface
  return {
    message: originalError.message || 'An unexpected error occurred', // Fallback message
    extensions: {
      code: originalError.statusCode || 'INTERNAL_SERVER_ERROR', // Fallback status code
      error: originalError.error || 'Unknown error', // Fallback error type
    },
  };
};
