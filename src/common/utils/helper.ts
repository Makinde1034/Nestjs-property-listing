/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { HttpException, HttpStatus } from '@nestjs/common';
import { AppStrings } from 'src/common/messages/app.strings';
/**
 * Getting difference between two dates.
 * @param date2 string | Date
 * @param date1 string | Date
 * @returns
 */

export const timeDifferenceInMillSecs = (
  date2: string | Date,
  date1: string | Date,
): number => {
  try {
    return new Date(date2).getTime() - new Date(date1).getTime();
  } catch (err) {
    throw new HttpException(
      {
        message: AppStrings.WRONG_TIME_ORDER,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
};

export const stringToJson = (object: any) => {
  try {
    return JSON.parse(object);
  } catch (err) {
    return JSON.parse(JSON.stringify(object));
  }
};

export const parseObjectValues = (
  object: Record<string, any>,
): Record<string, any> => {
  if (object && typeof object === 'object') {
    try {
      Object.entries(object).forEach(([key, value]) => {
        object[key] = stringToJson(value);
      });
    } catch (err) {
      throw new HttpException('Error parsing object values:', err);
    }
  }
  return object;
};
