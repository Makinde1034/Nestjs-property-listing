import { Allow } from 'class-validator';

export default class QueryDTO {
  @Allow()
  readonly query: { [key: string]: any } = {};

  @Allow()
  readonly fields: string | string[];

  @Allow()
  readonly limit: number;

  @Allow()
  readonly page: number;

  @Allow()
  readonly sort: string | string[];

  @Allow()
  readonly search: string;

  @Allow()
  readonly searchFields: string[];

  @Allow()
  readonly populate: string[];
}
