import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {Category} from "../../models/category";
import {CategoryService} from "../../services/category.service";
import {map, tap, catchError} from "rxjs/operators";
import {Product} from "../../models/product";
import {ProductService} from "../../services/product.service";
import { of } from 'rxjs';
import { environment } from '../../../environments/environment.development';

declare var $: any;

@Component({
  selector: 'app-featured-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-product.component.html'
})
export class FeaturedProductComponent implements OnInit {
  /**
   * Mảng lưu trữ dữ liệu danh mục, sản phẩm được lấy từ API
   */
  categories: Category[] = []; // Dữ liệu động từ categoryService
  products: Product[] = [];
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;
  totalProducts = 0;
  keyword = '';
  categoryId = 0;

  /**
   * Constructor tiêm các service và thông tin nền tảng cần thiết
   * @param platformId - Dùng để kiểm tra xem code có đang chạy trong trình duyệt không
   * @param categoryService - Service để lấy dữ liệu danh mục từ API
   * @param productService
   */
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private categoryService: CategoryService,
    private productService: ProductService) { }


  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeMixItUp();
      }, 0);
    }
    // Lấy dữ liệu danh mục (trang 0, giới hạn 100)
    this.getCategories(0, 100);
    // Lấy dữ liệu sản phẩm (trang 0, giới hạn 12)
    this.getFeaturedProducts( this.keyword, this.categoryId, this.currentPage, this.pageSize);
  }

  initializeMixItUp(): void {
    if (typeof (window as any).$ !== 'undefined' && (window as any).$('.featured__controls').length) {
      const $ = (window as any).$;
      (window as any).mixitup('.featured__filter', {
        selectors: {
          target: '.mix'
        },
        animation: {
          duration: 300
        }
      });

      $('.featured__controls li').on('click', (event: any) => {
        $('.featured__controls li').removeClass('active');
        $(event.currentTarget).addClass('active');
      });
    }
  }

  /**
   * Định dạng tên danh mục thành định dạng 'fresh-fruit'
   * @param name - Tên danh mục gốc
   * @returns Tên danh mục đã định dạng
   */
  private formatCategoryName(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Lấy danh mục từ API và xử lý URL hình ảnh của chúng
   * Sử dụng RxJS pipe và map để biến đổi luồng dữ liệu
   *
   * @param page - Số trang cho phân trang
   * @param limit - Số lượng mục trên mỗi trang
   */
  private getCategories(page: number, limit: number): void {
    this.categoryService.getCategories(page, limit).pipe(
      // Biến đổi mỗi danh mục để định dạng URL hình ảnh
      map((categories: Category[]) => categories.map(category => ({
        ...category,  // Giữ tất cả thuộc tính hiện có của danh mục
        formattedName: this.formatCategoryName(category.name) // Định dạng tên danh mục
      })))
    ).subscribe({
      // Xử lý phản hồi thành công
      next: (categories: Category[]) => {
        this.categories = categories;  // Cập nhật mảng danh mục của component
      },
      // Xử lý lỗi
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
  }


  getFeaturedProducts( keyword: string,categoryId: number,page: number,limit: number) {
    this.productService.getFeaturedProducts(keyword,categoryId,page,limit).pipe(
      //tap(response => console.log('API response:', response)),
      map((response: any) => {
        // Giả sử API trả về một đối tượng có thuộc tính 'products' là một mảng
        const products = response.products || [];
        return products.map((product: Product) => {
          const category = this.categories.find(c => c.id === product.category_id);
          const categoryName = category ? category.name : '';
          return {
            ...product,
            thumbnail: `${environment.apiBaseUrl}/products/images/${product.thumbnail}`,
            url: `/${this.formatCategoryName(categoryName)}/${this.formatCategoryName(product.name)}`,
            product_images: product.product_images.map(image => ({
              ...image,
              image_url: `${environment.apiBaseUrl}/products/images/${image.image_url}`
            }))
          };
        });
      }),
      catchError(error => {
        console.error('Error fetching featured products:', error);
        return of([]); // Trả về một mảng rỗng trong trường hợp lỗi
      })
    ).subscribe({
      next: (products: Product[]) => {
        this.products = products;
      },
      error: (error) => {
        // Lỗi đã được xử lý trong catchError, nhưng vẫn có thể log ở đây nếu cần
        console.error('Subscription error:', error);
      }
    });
  }

  getProductCategoryClasses(product: Product): string {
    const category = this.categories.find(c => c.id === product.category_id);
    return category ? (category.formattedName ?? '') : '';
  }

  getProductImageUrl(product: Product): string {
    if (product.product_images && product.product_images.length > 0) {
      return product.product_images[0].image_url;
    }
    // Nếu không có hình ảnh trong product_images, sử dụng thumbnail
    return product.thumbnail;
  }
}
