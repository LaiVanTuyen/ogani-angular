import {Component, OnInit, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, CommonModule} from '@angular/common';
import {RouterLink, Router, ActivatedRoute} from '@angular/router';
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
import { NgSelectModule } from '@ng-select/ng-select';

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
    FormsModule,
    NgSelectModule
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
  private sliderMin = 0;
  private sliderMax = 540;
  selectedSort = {label: 'Default', value: ''};  // Khởi tạo giá trị mặc định
  sortOptions = [
    {label: 'Default', value: ''},
    {label: 'Price: Low to High', value: 'price-asc'},
    {label: 'Price: High to Low', value: 'price-desc'},
    {label: 'Name: A-Z', value: 'name-asc'},
    {label: 'Name: Z-A', value: 'name-desc'}
  ];

  /**
   * Constructor tiêm các service và thông tin nền tảng cần thiết
   * @param platformId - Dùng để kiểm tra xem code có đang chạy trong trình duyệt không
   * @param categoryService - Service để lấy dữ liệu danh mục từ API
   */
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private categoryService: CategoryService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    // Đọc query params từ URL
    this.route.queryParams.subscribe(params => {
      // Đọc sort
      const sortValue = params['sort'] || '';
      if (sortValue) {
        const option = this.sortOptions.find(opt => opt.value === sortValue);
        if (option) {
          this.selectedSort = option;
          if (sortValue.includes('-')) {
            const [sortBy, sortDir] = sortValue.split('-');
            this.sortBy = sortBy;
            this.sortDir = sortDir;
          } else {
            this.sortBy = sortValue;
            this.sortDir = 'asc';
          }
        }
      }

      // Đọc page
      const page = parseInt(params['page']) || 1;
      this.currentPage = page;

      // Đọc category
      const categoryId = parseInt(params['category']) || 0;
      if (categoryId > 0) {
        this.selectedCategoryId = categoryId;
      }

      // Đọc price range
      const qpMin = params['min_price'];
      const qpMax = params['max_price'];
      this.minPrice = qpMin !== undefined ? (qpMin === '' ? null : Number(qpMin)) : null;
      this.maxPrice = qpMax !== undefined ? (qpMax === '' ? null : Number(qpMax)) : null;

      // Load products sau khi đã đọc hết params
      this.getProducts();
    });

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeShopJS();
      }, 0);
    }
    // Lấy dữ liệu danh mục (trang 0, giới hạn 100)
    this.getCategories(0, 100);
  }

  initializeShopJS(): void {
    // Kiểm tra xem jQuery đã được định nghĩa chưa
    if (typeof (window as any).$ !== 'undefined') {
      const $ = (window as any).$;

      const $slider = $('.price-range');
      if ($slider.length) {
        const dataMin = Number($slider.data('min')) || 0;
        const dataMax = Number($slider.data('max')) || 540;
        this.sliderMin = dataMin;
        this.sliderMax = dataMax;

        const startMin = this.minPrice != null ? this.minPrice : dataMin;
        const startMax = this.maxPrice != null ? this.maxPrice : dataMax;

        const formatWithDollar = (v: number) => `${v} $`;
        const parseFromInput = (val: any, fallback: number) => {
          const raw = String(val ?? '');
          const cleaned = raw.replace(/[^0-9.]/g, '');
          const num = parseFloat(cleaned);
          return isNaN(num) ? fallback : num;
        };

        // Khởi tạo slider
        $slider.slider({
          range: true,
          min: dataMin,
          max: dataMax,
          values: [startMin, startMax],
          slide: (event: any, ui: any) => {
            $('#minamount').val(formatWithDollar(ui.values[0]));
            $('#maxamount').val(formatWithDollar(ui.values[1]));
          },
          stop: (event: any, ui: any) => {
            this.onPriceRangeChange(ui.values[0], ui.values[1]);
          }
        });

        // Đồng bộ input ban đầu (hiển thị kèm $)
        $('#minamount').val(formatWithDollar(startMin)).attr('placeholder', formatWithDollar(dataMin));
        $('#maxamount').val(formatWithDollar(startMax)).attr('placeholder', formatWithDollar(dataMax));

        // Lắng nghe thay đổi từ input
        const self = this;
        $('#minamount, #maxamount').on('change keyup', function (e: any) {
          if (e.type === 'change' || e.key === 'Enter') {
            let minVal = parseFromInput($('#minamount').val(), dataMin);
            let maxVal = parseFromInput($('#maxamount').val(), dataMax);
            // Clamp
            minVal = Math.max(dataMin, Math.min(minVal, dataMax));
            maxVal = Math.max(dataMin, Math.min(maxVal, dataMax));
            if (minVal > maxVal) {
              const t = minVal; minVal = maxVal; maxVal = t;
            }
            $slider.slider('values', [minVal, maxVal]);
            // Cập nhật lại input kèm $
            $('#minamount').val(formatWithDollar(minVal));
            $('#maxamount').val(formatWithDollar(maxVal));
            self.onPriceRangeChange(minVal, maxVal);
          }
        });
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
      this.sortDir,
      this.minPrice,
      this.maxPrice
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
        this.products = [...products]; // luôn tạo mảng mới để Angular nhận ra thay đổi
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

    // Cập nhật URL với category (loại bỏ nếu = 0) và reset page về 1
    const queryParams: any = { page: 1 };
    queryParams.category = categoryId > 0 ? categoryId : null; // null sẽ xóa param
    // Giữ sort nếu đang dùng, nếu Default thì xóa
    queryParams.sort = this.selectedSort?.value ? this.selectedSort.value : null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });

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

  onNgSelectSortChange(selectedOption: any) {
    const sortValue = selectedOption?.value || '';
    this.selectedSort = selectedOption;

    // Cập nhật URL với sort (loại bỏ nếu Default) và giữ category nếu có
    const queryParams: any = { page: 1 };
    queryParams.sort = sortValue ? sortValue : null; // null sẽ xóa param
    queryParams.category = this.selectedCategoryId > 0 ? this.selectedCategoryId : null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });

    if (sortValue && sortValue.includes('-')) {
      const [sortBy, sortDir] = sortValue.split('-');
      this.sortBy = sortBy;
      this.sortDir = sortDir;
    } else {
      this.sortBy = sortValue;
      this.sortDir = 'asc';
    }
    this.currentPage = 1;
    this.getProducts();
  }

  onPageChange(page: number) {
    this.currentPage = page;

    // Cập nhật URL với page, loại bỏ sort/category nếu ở trạng thái mặc định
    const queryParams: any = { page };
    queryParams.category = this.selectedCategoryId > 0 ? this.selectedCategoryId : null;
    queryParams.sort = this.selectedSort?.value ? this.selectedSort.value : null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });

    this.getProducts();
  }

  onPriceChange(min: number, max: number) {
    this.minPrice = min;
    this.maxPrice = max;
    this.currentPage = 1;
    this.getProducts();
  }

  onPriceRangeChange(min: number, max: number) {
    this.minPrice = min;
    this.maxPrice = max;
    this.currentPage = 1;

    // Cập nhật URL với min_price/max_price (xóa nếu bằng default)
    const queryParams: any = { page: 1 };
    const isDefaultRange = (min === this.sliderMin) && (max === this.sliderMax);
    queryParams.min_price = isDefaultRange ? null : min;
    queryParams.max_price = isDefaultRange ? null : max;

    // Giữ category và sort nếu có
    queryParams.category = this.selectedCategoryId > 0 ? this.selectedCategoryId : null;
    queryParams.sort = this.selectedSort?.value ? this.selectedSort.value : null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });

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

  compareByValue(item1: any, item2: any): boolean {
    return item1 && item2 && item1.value === item2.value;
  }
}
