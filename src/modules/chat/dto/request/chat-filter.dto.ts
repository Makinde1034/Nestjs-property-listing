import { IsNotEmpty, IsString } from 'class-validator';
import { PaginateAndSort } from '../../../core/dto/pagination-and-sort.dto';

export class ChatFilter extends PaginateAndSort {
  @IsString()
  @IsNotEmpty()
  ticketId: string;
}
