import { User } from 'src/entities';
import * as bcrypt from 'bcrypt';

export const SuperAdminData: Partial<User> = {
  firstName: 'Super',
  lastName: 'Admin',
  email: 'admin@waseet.com',
  password: bcrypt.hashSync('Admin@2024', 10),
  verifiedAt: new Date(),
  userType: 'admin',
  phone: '+1100299111',
};
