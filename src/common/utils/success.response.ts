import { Logger } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

const AppLogger = new Logger();

export class SuccessResponse {
  status: number;

  @Field()
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

@ObjectType()
export class SuccessResponseWithDataPayload {
  @Field()
  status: number;

  @Field()
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
