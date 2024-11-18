import { DeepPartial } from 'typeorm';
import { SystemFeatureSetting } from '../../entities/system-features.entity';

export const SystemFactory: DeepPartial<SystemFeatureSetting>[] = [
  {
    englishName: 'Auctions Creation',
    arabicName: 'إنشاء المزادات',
    slug: 'auctions-creation',
    description: 'Allows or disables the ability to create auctions.',
    createdAt: '2024-11-17T10:00:00Z',
    updatedAt: '2024-11-17T10:00:00Z',
    deleteAt: null,
  },
  {
    englishName: 'Services Requests',
    arabicName: 'طلبات الخدمات',
    slug: 'services-requests',
    description: 'Allows or disables the ability to request services.',
    createdAt: '2024-11-17T10:00:00Z',
    updatedAt: '2024-11-17T10:00:00Z',
    deleteAt: null,
  },
  {
    englishName: 'Service Provider Registrations',
    arabicName: 'تسجيل مزودي الخدمات',
    slug: 'service-provider-registrations',
    description:
      'Allows or disables the ability to apply as a service provider.',
    createdAt: '2024-11-17T10:00:00Z',
    updatedAt: '2024-11-17T10:00:00Z',
    deleteAt: null,
  },
  {
    englishName: 'Manual Rental',
    arabicName: 'إيجار يدوي',
    slug: 'manual-rental',
    description: 'Allows or disables the ability to rent tasks manually.',
    createdAt: '2024-11-17T10:00:00Z',
    updatedAt: '2024-11-17T10:00:00Z',
    deleteAt: null,
  },
  {
    englishName: 'Manual Sale',
    arabicName: 'بيع يدوي',
    slug: 'manual-sale',
    description: 'Allows or disables the ability to buy tasks manually.',
    createdAt: '2024-11-17T10:00:00Z',
    updatedAt: '2024-11-17T10:00:00Z',
    deleteAt: null,
  },
];
