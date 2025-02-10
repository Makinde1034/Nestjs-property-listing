import { DeepPartial } from 'typeorm';
import { AttributeSet } from '../../entities';

export const AttributSetFactory: DeepPartial<AttributeSet>[] = [
  {
    arabicName: 'مبنى',
    englishName: 'Building',
    attributes: [],
  },

  {
    arabicName: 'فيلا',
    englishName: 'Villa',
    attributes: [],
  },
  {
    arabicName: 'مزرعة',
    englishName: 'Farm',
  },
  {
    arabicName: 'عناصر العنوان الأساسي',
    englishName: 'Basic Address',
  },
  {
    arabicName: 'وحدة سكنية',
    englishName: 'Apartment',
  },
];
