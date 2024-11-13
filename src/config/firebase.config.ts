import { registerAs } from '@nestjs/config';

const key = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const projectId = process.env.FIREBASE_PROJECT_ID;
const email = process.env.FIREBASE_EMAIL;

export type FireBaseConfig = {
  key: string;
  projectId: string;
  email: string;
};

const getFireBaseConfig = (): FireBaseConfig => ({
  key: key,
  projectId: projectId,
  email: email,
});

export const getFireBaseConfigName = () => 'fireBase';
export default registerAs(getFireBaseConfigName(), getFireBaseConfig);
