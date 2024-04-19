import { User } from 'src/entities';

export class RegisterEventDto {
  constructor(public user: User) {}
}
