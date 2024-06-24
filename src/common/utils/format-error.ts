/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { GraphQLFormattedError } from 'graphql';
import { OriginalError } from '../interface';

export const formatError = (
  error: GraphQLFormattedError,
): GraphQLFormattedError => {
  const originalError = error.extensions.originalError as OriginalError;
  console.log(error.extensions);

  if (!originalError) {
    return {
      message: error.message,
      extensions: {
        code: error.extensions.code,
      },
    };
  }
  return {
    message: originalError.message as string,
    extensions: {
      code: originalError.statusCode,
      error: originalError.error,
    },
  };
};
