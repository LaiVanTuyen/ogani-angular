import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getCategories(page: number, limit: number): Observable<Category[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<Category[]>(`${this.apiBaseUrl}/categories`, { params });
  }

  getDetailCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiBaseUrl}/categories/${id}`);
  }

  deleteCategory(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiBaseUrl}/categories/${id}`);
  }
}
