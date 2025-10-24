import {ProductImage} from "./product.image";

export interface Product {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  description: string;
  category_id: number;
  url: string;
  product_images: ProductImage[];
  actualSalePercent?: number;
  availability: string;
  // optional: populated from CommentStats API when available
  reviewCount?: number;
  avgRating?: number;

}
