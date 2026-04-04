export class CreateListingDto {
  title: string;
  description?: string;
  price: number;
  category: string;
  condition: string;
  images?: string[];
}
