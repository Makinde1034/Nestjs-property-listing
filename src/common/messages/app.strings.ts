/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

export const AppStrings = {
  APP_NAME: 'Waseet',
  RESOURCE_ALREADY_EXISTS: 'Resource already exist',
  FAILED_RACAPTCHA: 'Recaptcha Failed, Please try again',
  USER_DISABLED: 'Your account has been disabled. ',
  UNCONFIRMED_ACCOUNT:
    'Your account is not confirmed. Please check your email for the confirmation link.',
  SUSPENDED_ACCOUNT: 'Your account has been suspended.',
  INCORRECT_CREDENTIALS: 'Invalid Password Or Email',
  INVALID_QUERY: 'Invalid query, kindly check your query',
  UNSUPPORTED_ACTION: ' Unsupported action ',
  FIELD_NOT_EXIST: (field: string): string =>
    `Invalid query, ${field} doesn't exist`,
  WRONG_DATA_FOR_FIELD: (field: string): string =>
    `Invalid query, ${field} entry in query is wrong`,
  WRONG_CONFIRM_CODE: 'The confirmation code is incorrect. Please try again.',
  CONFIRMATION_SENT:
    'A confirmation email has been sent. Please check your email.',
  ACCOUNT_ALREADY_CONFIRMED:
    'Your account is already confirmed. Please log in.',
  ACCOUNT_CONFIRMED_SUCCESSFULLY:
    'Your account has been confirmed successfully.',
  PASSWORD_RESET_SENT:
    'A password reset link has been sent. Please check your email.',
  PASSWORD_RESET_EXPIRED: 'The password reset link has expired. ',
  PASSWORD_RESET_SUCCEEDED: 'Your password has been reset successfully.',
  PASSWORD_RESET_FAILED: 'Password reset failed.',
  ACCOUNT_CREATED_SUCCESSFULLY: 'Your account has been successfully created.',
  WRONG_TIME_ORDER: 'Wrong time order',
  USER_NOT_FOUND: 'User not found',
  NO_IMAGE_SELECTED: 'No image selected',
  NOTIFICATION_SENT_SUCCESSFULLY: 'Notification sent successfully',
  UNABLE_TO_DELETE_ATTRIBUTE:
    'Attribute cannot be deleted because it isused by an attribute set',
  ATTRIBUTE_DELETED_SUCCESSFULLY: 'Attribute deleted successfully',
  ATTRIBUTE_NOT_FOUND: 'Attribute not found',
  ATTRIBUTE_SET_NOT_FOUND: 'Attribute set not found',

  ATTRIBUTESET_DELETED_SUCCESSFULLY: 'Attribute set deleted successfully',
  LISTINGTYPE_DELETED_SUCCESSFULLY: 'Listing type deleted successfully',
  ROLE_DELETED_SUCCESSFULLY: 'Roledeleted successfully',
  INCORRECT_PASSWORD: 'incorrect Password',
  INCORRECT_OLD_PASSWORD:
    'The old password entered is incorrect. Please try again.',
  UNABLE_TO_DELETE_ISSUE_CATEGORY:
    'ISSUE_CATEGORY_CAN_NOT_BE_DELETED_AS_IT_IS_BEING_USED_BY_AN_ISSUE',
  ISSUE_CATEGORY_DELETED_SUCCESSFULLY: 'ISSUE_CATEGORY_DELETED_SUCCESSFULLY',
  ISSUE_CATEGORY_NOT_FOUND: 'Issue category not found',

  ISSUE_DELETED_SUCCESSFULLY: 'ISSUE_DELETED_SUCCESSFULLY',
  TWO_FA_NOT_ENABLED:
    'Two-factor authentication is not enabled on your account.',
  INCORRECT_TOKEN: 'The code provided is incorrect. Please try again.',
  TICKET_RAISED_SUCCESSFULLY: 'TICKET_RAISED_SUCCESSFULLY',
  EXPIRED_NATIONAL_ID: 'National Identity has Expired',
  EMAIL_ALREADY_CONFIRMED: 'This email has already been confirmed',
  INVALID_USER: 'This user does not exist',
  INVALID_NATIONAL_ID: 'The Identity number provided is invalid',

  SERVICE_OWNER_NOT_FOUND: 'INVALID_SERVICE_OWNER ID',
  NOT_FOUND: 'not found',

  LISTING_FLAG_SUCCESSFULL: 'Listing has been flagged',

  LISTING_DISABLE_SUCCESSFULLY: 'Listing has been disabled',

  LISTING_ENABLED_SUCCESSFULLY: 'Listing has been enabled',

  LISTING_DELETED_SUCCESSFULLY: 'Listing has been deleted',
  LISTING_UNPUBLISHED_SUCCESSFULLY: 'Listing has been unpublished',

  DELETED_SUCCESSFULLY: 'Successfully deleted',

  LISTING_NOT_FOUND: 'Listing not found',

  LISTING_TYPE_NOT_FOUND: 'Listing Type  was not found.',

  UPLOAD_SUCCESSFUL: 'Upload successful',
  LISTING_IS_NOT_NEGOTIABLE: 'listing is not negotiable',

  INTERNAL_SERVER_EXCEPTION:
    'Something went wrong on our server. We are working to fix it',

  WISHLIST_CREATION_FAILED: 'failed to add to wishlist',
  N0T_AN_ATTRIBUTE: 'not an attribute',

  WISHLIST_DELETE_SUCCESS: 'removed from wishlist',
  CANNOT_EDIT_AUCTION_ONCE_IT_HAS_STARTED:
    'Cannot edit auction after it has started',
  START_DATE_CANNOT_BE_LESS_THAN_DATE_0F_CREATION:
    'Start date cannot be less than data of creation.',

  AUCTION_DURATION_IS_BETWEEN_4_TO_24_HOURS:
    'Auction duration is between 4 to 24 hours',

  AUCTION_NOT_FOUND: 'Auction not found',

  AUCTION_IS_NOT_COMPLETELY_SET_UP:
    'Listing cannot be added because auction is not fully configured',

  AUCTION_REGISTRATION_HAS_NOT_STARTED: 'Auction registration has not started',
  AUCTION_REGISTATION_HAS_ENDED: 'Auction registration has ended',
  SUCCESSFULLY_DISABLED: 'Successfully disabled',
  SUCCESSFULL: 'Successfull',

  CANNOT_ACCEPT_AN_OFFER_WHILE_LISTING_IS_BEING_AUCTIONED:
    'Cannot accept an offer while listing is being auctioned',
};
