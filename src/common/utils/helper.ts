import { HttpException, HttpStatus } from '@nestjs/common';
import { AppStrings } from '../messages/app.strings';
/**
 * Getting difference between two dates.
 * @param date2 string | Date
 * @param date1 string | Date
 * @returns
 */
export const timeDifferenceInMillSecs = (
  date2: string | Date,
  date1: string | Date,
) => {
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

export const parseObjectValues = (object: any) => {
  try {
    Object.keys(object).forEach(
      (key: any) => (object[key] = stringToJson(object[key])),
    );
    return object;
  } catch (err) {
    return object;
  }
};
