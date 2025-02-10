import { DeepPartial } from 'typeorm';
import { ListingType } from '../../entities';
export const listingTypeFactory: DeepPartial<ListingType>[] = [
  {
    englishName: 'Apartment',
    arabicName: 'وحدة سكنية',
    icon: 'https://storage.googleapis.com/waseet-dev/27734345-image (1).png',
  },
  {
    englishName: 'Building',
    arabicName: 'مبنى',
    icon: 'https://storage.googleapis.com/waseet-dev/77087290-image.png',
  },
  {
    englishName: 'Farm',
    arabicName: 'مزرعة',
    icon: 'https://storage.googleapis.com/waseet-dev/63854196-image (2).png',
  },
  {
    englishName: 'Villa',
    arabicName: 'فيلا',
    icon: 'https://storage.googleapis.com/waseet-dev/23210526-image (3).png',
  },
];
