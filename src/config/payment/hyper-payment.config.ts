import { registerAs } from '@nestjs/config';

const token = process.env.HYPERPAY_TOKEN;
const baseUrl = process.env.HYPERPAY_BASE_URL;
const entityId = process.env.HYPERPAY_ENTITY_ID;
console.log(token, baseUrl, entityId);

export type HyperpayConfig = {
  token: string;
  baseUrl: string;
  entityId: string;
};

if (!token || !baseUrl) {
  throw new Error(
    'Missing configuration. Please ensure you provided HYPERPAY_TOKEN | HYPERPAY_BASE_URL | HYPERPAY_ENTITY_ID',
  );
}

const getHyperpayConfig = (): HyperpayConfig => ({
  token: token,
  baseUrl: baseUrl,
  entityId: entityId,
});

export const getHyperpayConfigName = () => 'hyperpayConfig';
export default registerAs(getHyperpayConfigName(), getHyperpayConfig);
