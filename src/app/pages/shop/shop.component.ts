import {Component, OnInit, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {LatestProductSliderComponent} from "../../shared/latest-product-slider/latest-product-slider.component";
import {ProductDiscountSliderComponent} from "../../shared/product-discount-slider/product-discount-slider.component";
import {FooterComponent} from "../../shared/footer/footer.component";
import {HeaderComponent} from "../../shared/header/header.component";
import {CategoryService} from "../../services/category.service";
import {Category} from "../../models/category";
import {map} from "rxjs/operators";
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { environment } from '../../../environments/environment.development';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LatestProductSliderComponent,
    ProductDiscountSliderComponent,
    FooterComponent,
    HeaderComponent,
    FormsModule
  ],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  /**
   * Mảng lưu trữ dữ liệu danh mục được lấy từ API
   */
  categories: Category[] = []; // Dữ liệu động từ categoryService
  products: Product[] = [];
  currentPage = 1;
  pageSize = 9;
  totalProducts = 0;
  totalPages = 1;
  keyword = '';
  selectedCategoryId: number = 0;
  sortBy: string = '';
  sortDir: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  /**
   * Constructor tiêm các service và thông tin nền tảng cần thiết
   * @param platformId - Dùng để kiểm tra xem code có đang chạy trong trình duyệt không
   * @param categoryService - Service để lấy dữ liệu danh mục từ API
   */
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private categoryService: CategoryService,
    private productService: ProductService
  ) {
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Sử dụng setTimeout để đảm bảo JavaScript chạy sau khi DOM đã tải
      setTimeout(() => {
        this.initializeShopJS();
      }, 0);
    }
    // Lấy dữ liệu danh mục (trang 0, giới hạn 100)
    this.getCategories(0, 100);
    this.getProducts();
  }

  initializeShopJS(): void {
    // Kiểm tra xem jQuery đã được định nghĩa chưa
    if (typeof (window as any).$ !== 'undefined') {
      const $ = (window as any).$;

      // Price Range Slider
      if ($('.price-range').length) {
        $('.price-range').slider({
          range: true,
          min: 10,
          max: 540,
          values: [10, 540],
          slide: function (event: any, ui: any) {
            $('#minamount').val('$' + ui.values[0]);
            $('#maxamount').val('$' + ui.values[1]);
          }
        });
        $('#minamount').val('$' + $('.price-range').slider("values", 0));
        $('#maxamount').val('$' + $('.price-range').slider("values", 1));
      }
    }
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

  getProducts(): void {
    this.productService.getProducts(
      this.keyword,
      this.selectedCategoryId,
      this.currentPage - 1,
      this.pageSize,
      this.sortBy,
      this.sortDir
    ).pipe(
      map((result: any) => {
        // Ensure products is an array
        const products = (result && Array.isArray(result.products)) ? result.products : [];
        // Get totalPages from API, default to 0 if not provided
        this.totalPages = result && typeof result.totalPages === 'number' ? result.totalPages : 0;

        // If the API returns total, use it. Otherwise, estimate totalProducts.
        if (result && typeof result.total === 'number') {
          this.totalProducts = result.total;
        } else {
          // Estimate totalProducts based on totalPages. This might not be perfectly accurate for the last page.
          this.totalProducts = this.totalPages * this.pageSize;
        }

        // Handle the case where there are no products
        if (products.length === 0) {
          this.totalProducts = 0;
        }

        // Process product images
        return products.map((product: Product) => ({
          ...product,
          thumbnail: `${environment.apiBaseUrl}/products/images/${product.thumbnail}`,
          product_images: product.product_images.map(image => ({
            ...image,
            image_url: `${environment.apiBaseUrl}/products/images/${image.image_url}`
          }))
        }));
      })
    ).subscribe({
      next: (products: Product[]) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.products = [];
        this.totalProducts = 0;
        this.totalPages = 1;
      }
    });
  }

  onCategoryChange(categoryId: number) {
    this.selectedCategoryId = categoryId;
    this.currentPage = 1;
    this.getProducts();
  }

  onSortChange(event: any) {
    const sortValue = event.target.value;
    if (sortValue.includes('-')) {
      const [sortBy, sortDir] = sortValue.split('-');
      this.sortBy = sortBy;
      this.sortDir = sortDir;
    } else {
      this.sortBy = sortValue;
      this.sortDir = 'asc'; // Default direction
    }
    this.currentPage = 1;
    this.getProducts();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getProducts();
  }

  onPriceChange(min: number, max: number) {
    this.minPrice = min;
    this.maxPrice = max;
    this.currentPage = 1;
    this.getProducts();
  }

  /**
   * Định dạng tên danh mục thành định dạng 'fresh-fruit'
   * @param name - Tên danh mục gốc
   * @returns Tên danh mục đã định dạng
   */
  private formatCategoryName(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  get pageCount(): number {
    return Math.ceil(this.totalProducts / this.pageSize) || 1;
  }

  // Helper to generate an array for pagination
  get pageArray(): number[] {
    return Array(this.pageCount).fill(0).map((x, i) => i + 1);
  }

  // Smart pagination display logic
  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];

    if (total <= 3) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (current <= 2) {
      return [1, 2, 3];
    }

    if (current >= total - 1) {
      return [total - 2, total - 1, total];
    }

    return [current - 1, current, current + 1];
  }

  getDisplayedProductsInfo(): string {
    if (this.totalProducts === 0) {
      return `0/0`;
    }
    const startItem = (this.currentPage - 1) * this.pageSize + 1;
    const endItem = Math.min(this.currentPage * this.pageSize, this.totalProducts);
    return `${startItem}-${endItem}/${this.totalProducts}`;
  }

  getProductImageUrl(product: Product): string {
    if (product.product_images && product.product_images.length > 0) {
      return product.product_images[0].image_url;
    }
    // Nếu không có hình ảnh trong product_images, sử dụng thumbnail
    return product.thumbnail;
  }
}
