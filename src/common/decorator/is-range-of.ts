/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsRangeConstraint implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments) {
    const [min, max] = args.constraints;
    return typeof value === 'number' && value >= min && value <= max;
  }

  defaultMessage(args: ValidationArguments) {
    const [min, max] = args.constraints;
    return `The value must be between ${min} and ${max}`;
  }
}

export function IsRange(
  min: number,
  max: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [min, max],
      validator: IsRangeConstraint,
    });
  };
}
