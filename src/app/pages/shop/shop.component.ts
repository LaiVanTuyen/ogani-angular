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

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink, LatestProductSliderComponent, ProductDiscountSliderComponent, LatestProductSliderComponent, ProductDiscountSliderComponent, FooterComponent, HeaderComponent],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  /**
   * Mảng lưu trữ dữ liệu danh mục được lấy từ API
   */
  categories: Category[] = []; // Dữ liệu động từ categoryService

  /**
   * Constructor tiêm các service và thông tin nền tảng cần thiết
   * @param platformId - Dùng để kiểm tra xem code có đang chạy trong trình duyệt không
   * @param categoryService - Service để lấy dữ liệu danh mục từ API
   */
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private categoryService: CategoryService) {
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

  /**
   * Định dạng tên danh mục thành định dạng 'fresh-fruit'
   * @param name - Tên danh mục gốc
   * @returns Tên danh mục đã định dạng
   */
  private formatCategoryName(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }
}
