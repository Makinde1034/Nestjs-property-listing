import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMessageInput {
  @IsString()
  @IsNotEmpty()
  message: string;
  @IsString()
  @IsOptional()
  chatId: string;
  @IsString()
  @IsNotEmpty()
  ticketId: string;
}
