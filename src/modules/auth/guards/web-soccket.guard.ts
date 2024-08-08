import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = client.handshake.headers.authorization;

    // Implement your token validation logic here
    if (token) {
      // Validate the token and extract user information
      return true; // or false based on validation
    }

    return false;
  }
}
