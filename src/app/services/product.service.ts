import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/product';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  // Lấy danh sách sản phẩm theo từ khóa, danh mục, phân trang và giới hạn số lượng
  getProducts(
    keyword: string,
    categoryId: number,
    page: number,
    limit: number
  ): Observable<Product[]> {
    const params = {
      keyword: keyword,
      category_id: categoryId.toString(),
      page: page.toString(),
      limit: limit.toString()
    };
    return this.http.get<Product[]>(`${this.apiBaseUrl}/products`, { params });
  }

  // Lấy chi tiết một sản phẩm theo ID
  getDetailProduct(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiBaseUrl}/products/${productId}`);
  }

  // Lấy danh sách sản phẩm theo mảng ID
  getProductsByIds(productIds: number[]): Observable<Product[]> {
    const params = new HttpParams().set('ids', productIds.join(','));
    return this.http.get<Product[]>(`${this.apiBaseUrl}/products/by-ids`, { params });
  }

  // Lấy danh sách sản phẩm nổi bật
  getFeaturedProducts(
    keyword: string,
    categoryId: number,
    page: number,
    limit: number
  ): Observable<Product[]> {
    const params = {
      keyword: keyword,
      category_id: categoryId.toString(),
      page: page.toString(),
      limit: limit.toString()
    };
    return this.http.get<Product[]>(`${this.apiBaseUrl}/products/featured`, { params });
  }

}
