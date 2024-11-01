import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity } from 'typeorm';
import BaseEntity from './base.entity';

@ObjectType()
@Entity()
export class ServiceProvider extends BaseEntity {}
