/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Logger } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

const AppLogger = new Logger();

@ObjectType()
export class SuccessResponse {
  @Field({ nullable: true })
  status: number;

  @Field({ nullable: true })
  message: string;

  @Field(() => GraphQLJSON, { nullable: true })
  data: unknown;

  constructor(message: string = 'successful', data: unknown = null) {
    this.status = 200;
    this.message = message;
    this.data = data;
  }

  toJSON() {
    AppLogger.log(`(LOGS) Success - ${this.message}`);

    if (this.data) {
      return {
        status: 200,
        message: this.message,
        data: this.data,
      };
    }

    return {
      status: 200,
      message: this.message,
    };
  }
}
