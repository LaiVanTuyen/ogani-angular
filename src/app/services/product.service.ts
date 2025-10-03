import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Product} from '../models/product';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {
  }

  // Lấy danh sách sản phẩm theo từ khóa, danh mục, phân trang và giới hạn số lượng
  getProducts(
    keyword: string,
    categoryId: number,
    page: number,
    limit: number,
    sortBy?: string,
    sortDir?: string
  ): Observable<Product[]> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('category_id', categoryId.toString())
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (sortBy) {
      params = params.set('sort_by', sortBy);
    }
    if (sortDir) {
      params = params.set('sort_dir', sortDir);
    }
    return this.http.get<Product[]>(`${this.apiBaseUrl}/products`, {params});
  }

  // Lấy chi tiết một sản phẩm theo ID
  getDetailProduct(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiBaseUrl}/products/${productId}`);
  }

  // Lấy danh sách sản phẩm theo mảng ID
  getProductsByIds(productIds: number[]): Observable<Product[]> {
    const params = new HttpParams().set('ids', productIds.join(','));
    return this.http.get<Product[]>(`${this.apiBaseUrl}/products/by-ids`, {params});
  }

  // Lấy danh sách sản phẩm nổi bật
  getFeaturedProducts(
    keyword: string,
    categoryId: number,
    page: number,
    limit: number
  ): Observable<any> {
    const params = {
      keyword: keyword,
      category_id: categoryId.toString(),
      page: page.toString(),
      limit: limit.toString()
    };
    return this.http.get<any>(`${this.apiBaseUrl}/products/featured`, {params});
  }

  // lấy danh sách sản phẩm mới nhất
  getLatestProducts(
    keyword: string,
    categoryId: number,
    page: number,
    limit: number
  ): Observable<any> {
    const params = {
      keyword: keyword,
      category_id: categoryId.toString(),
      page: page.toString(),
      limit: limit.toString()
    };

    console.log('API URL:', `${this.apiBaseUrl}/products/latest`);
    console.log('Params:', params);
    return this.http.get<any>(`${this.apiBaseUrl}/products/latest`, {params});
  }

  // Lấy danh sách sản phẩm được đánh giá cao
  getTopRatedProducts(
    page: number,
    limit: number
  ): Observable<any> {
    const params = {
      page: page.toString(),
      limit: limit.toString()
    };
    return this.http.get<any>(`${this.apiBaseUrl}/products/top-rated`, {params});
  }

  // Lấy danh sách sản phẩm bán chạy nhất
  getTopSalesProducts(
    page: number,
    limit: number
  ): Observable<any> {
    const params = {
      page: page.toString(),
      limit: limit.toString()
    };
    return this.http.get<any>(`${this.apiBaseUrl}/products/top-sales`, {params});
  }

}
