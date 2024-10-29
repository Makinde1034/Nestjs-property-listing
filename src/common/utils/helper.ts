/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { HttpException, HttpStatus } from '@nestjs/common';
import { AppStrings } from '../../common/messages/app.strings';
import { v4 as uuidv4 } from 'uuid';
import * as exifr from 'exifr';

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

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Adds a specified number of days to a given date string.
 * @param dateString The input date string (e.g., '2024-06-12T00:00:00Z').
 * @param days The number of days to add.
 * @returns The new date as a formatted string (ISO format).
 */
export function addDaysToDate(dateString: string | Date, days: number): string {
  try {
    // Parse the input date string into a Date object

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    // Add the specified number of days
    date.setDate(date.getDate() + days);

    // Return the new date as an ISO formatted string
    return date.toISOString();
  } catch (error) {
    throw new Error('Failed to add days to date');
  }
}

export function calculateDaysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function removeDaysFromDate(
  dateString: string | Date,
  days: number,
): string {
  try {
    // Parse the input date string into a Date object

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    // Add the specified number of days
    date.setDate(date.getDate() - days);

    // Return the new date as an ISO formatted string
    return date.toISOString();
  } catch (error) {
    throw new Error('Failed to add days to date');
  }
}

export function toCamelCase(str: string): string {
  // Check if the input is a string
  if (typeof str !== 'string') {
    throw new Error('Input must be a string');
  }

  // Split the string by non-alphanumeric characters
  const words = str.split(/[\s-_]+/);

  // Map through the words and convert them to camel case
  return words
    .map((word, index) => {
      // Convert the first word to lowercase
      if (index === 0) {
        return word.toLowerCase();
      }
      // Capitalize the first letter of the subsequent words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

export function capitalizeFirstLetter(text: string): string {
  if (!text) return text; // Handle empty string
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function generateRandomString(): string {
  const data = `WASEET-${uuidv4()}-${randomNumbers(100000, 999999)}`;

  return data;
}

export const randomNumbers = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateRandomArray = (length: number, key_length: number) => {
  const keys = [];
  for (let i = 0; i < length; i++) {
    let key = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let j = 0; j < key_length; j++) {
      const random_index = Math.floor(Math.random() * characters.length);
      key += characters.charAt(random_index);
    }
    keys.push(key);
  }
  return keys;
};

export function checkIfEmailNameOrPhoneNumber(testStrings: string) {
  const regex =
    /^(?<email>[\w.%+-]+@[\w.-]+\.\w{2,})|(?<name>[A-Z][a-z]+\s[A-Z][a-z]+)|(?<phone>\+?\d{1,4}?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4})$/;

  const match = regex.exec(testStrings);
  if (match?.groups?.email) {
    return 'email';
  } else if (match?.groups?.name) {
    return 'name';
  } else if (match?.groups?.phone) {
    return 'phoneNumber';
  }
  return 'no match';
}

export function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  // Radius of the Earth in kilometers. Use 3956 for miles.
  const R = 6371.0;

  // Convert latitude and longitude from degrees to radians
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const lat1Rad = toRadians(lat1);
  const lon1Rad = toRadians(lon1);
  const lat2Rad = toRadians(lat2);
  const lon2Rad = toRadians(lon2);

  // Difference in coordinates
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  // Haversine formula
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in kilometers
  const distance = R * c;

  return distance;
}

export async function getLocationFromImage(fileBuffer: Buffer) {
  try {
    const metadata = await exifr.parse(fileBuffer, { gps: true });

    if (metadata?.latitude && metadata?.longitude) {
      return {
        latitude: metadata.latitude,
        longitude: metadata.longitude,
      };
    } else {
      return null;
    }
  } catch (error) {
    this.logger.error('Error extracting location from image:', error);
    throw error;
  }
}
