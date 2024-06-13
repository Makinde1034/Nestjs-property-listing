/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

export const one = [
  'name',
  'city',
  'district',
  'country',
  'street',
  'purpose',
  'images',
  //'deedNumber',
  'price',
  'landArea',
  'gpsCoordinates',
  //'propertyNumber',
];

export const two = ['numberOfBathrooms', 'numberOfRooms'];
export const three = ['rentedAppartment'];
export const four = ['level'];
export const five = ['numberOfStoreys'];
export const six = [
  'pool',
  'outdoorKitchen',
  'garden',
  'guestHouse',
  'tennisCourt',
  'basketballCourt',
  'jacuzzi',
  'bbqArea',
  'maidsRoom',
];
export const seven = ['petsAllowed', 'balcony'];
export const eight = [
  'gym',
  'playground',
  'parking',
  'security',
  'airConditioning',
  'storageRoom',
  'laundryRoom',
  'conferenceRoom',
  'gatedCommunity',
  'indoorPlayArea',
  'coveredParking',
  'wifi',
];
export const nine = ['elevator'];

export const villa = [...one, ...two, ...five, ...six, ...seven, ...eight];
export const appartment = [
  ...one,
  ...two,
  ...four,
  ...seven,
  ...eight,
  ...nine,
];
export const farm = [...one, ...five, ...six, ...eight, ...nine];
export const land = [...one];
export const building = [...one, ...three, ...five, ...eight, ...nine];
