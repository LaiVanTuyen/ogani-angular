/**
 * Import các thư viện cần thiết từ Angular và các thư viện bên thứ ba
 */
import { Component, OnInit, Inject, PLATFORM_ID, EventEmitter, Input, Output } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {Category} from "../../models/category";
import {CategoryService} from "../../services/category.service";
import {RouterLink} from "@angular/router";
import {environment} from "../../../environments/environment.development";
import {map} from "rxjs/operators";

/**
 * Khai báo biến jQuery để sử dụng với OwlCarousel
 */
declare var $: any;

/**
 * CategoriesSliderComponent
 *
 * Component này hiển thị slider dạng carousel cho các danh mục sản phẩm.
 * Nó lấy dữ liệu danh mục từ API, định dạng URL hình ảnh, và khởi tạo
 * slider OwlCarousel để hiển thị responsive trên các kích thước màn hình khác nhau.
 */
@Component({
  selector: 'app-categories-slider',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories-slider.component.html',
  styleUrls: ['./categories-slider.component.css']
})
export class CategoriesSliderComponent implements OnInit {
  /**
   * Mảng lưu trữ dữ liệu danh mục được lấy từ API
   */
  @Input() categories: Category[] = []; // Dữ liệu động từ categoryService
  @Output() categoryClick = new EventEmitter<number>();

  /**
   * Constructor tiêm các service và thông tin nền tảng cần thiết
   * @param platformId - Dùng để kiểm tra xem code có đang chạy trong trình duyệt không
   * @param categoryService - Service để lấy dữ liệu danh mục từ API
   */
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private categoryService: CategoryService) { }

  /**
   * Lifecycle hook khởi tạo component
   * Gọi initializeSlider() nếu đang trong môi trường trình duyệt và lấy danh mục
   */
  ngOnInit(): void {
    // Kiểm tra xem đang chạy trong trình duyệt (không phải trong server-side rendering)
    if (isPlatformBrowser(this.platformId)) {
      // Sử dụng setTimeout để đảm bảo DOM đã được tải hoàn toàn trước khi khởi tạo jQuery
      setTimeout(() => {
        this.initializeSlider();
      }, 0);
    }
    // Lấy dữ liệu danh mục (trang 0, giới hạn 100)
    this.getCategories(0, 100);
  }

  /**
   * Khởi tạo slider OwlCarousel với các tùy chọn cấu hình
   * Chỉ chạy nếu jQuery khả dụng và phần tử slider tồn tại trong DOM
   */
  initializeSlider(): void {
    if (typeof $ !== 'undefined' && $('.categories__slider').length) {
      $('.categories__slider').owlCarousel({
        loop: true,              // Trượt vòng lặp vô hạn
        margin: 0,              // Khoảng cách giữa các mục
        items: 4,               // Số lượng mục hiển thị trên desktop
        dots: false,            // Ẩn các chấm phân trang
        nav: true,              // Hiển thị mũi tên điều hướng
        navText: ["<span class='fa fa-angle-left'><span/>", "<span class='fa fa-angle-right'><span/>"],
        animateOut: 'fadeOut',  // Hiệu ứng khi thoát
        animateIn: 'fadeIn',    // Hiệu ứng khi vào
        smartSpeed: 1200,       // Tốc độ chuyển đổi
        autoHeight: false,      // Chiều cao cố định
        autoplay: true,         // Tự động phát slider
        // Cấu hình responsive cho các breakpoint
        responsive: {
            0: {                // Di động (0-479px)
                items: 1,       // Hiển thị 1 mục
            },
            480: {              // Thiết bị nhỏ (480-767px)
                items: 2,       // Hiển thị 2 mục
            },
            768: {              // Thiết bị trung bình (768-991px)
                items: 3,       // Hiển thị 3 mục
            },
            992: {              // Thiết bị lớn (992px trở lên)
                items: 4,       // Hiển thị 4 mục
            }
        }
      });
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
        image: this.formatCategoryImage(category.image)  // Định dạng URL hình ảnh
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
   * Định dạng URL hình ảnh danh mục dựa trên một số quy tắc:
   * - Trả về hình ảnh mặc định nếu hình ảnh là null/undefined
   * - Sử dụng URL hình ảnh nguyên bản nếu nó đã bắt đầu bằng 'http'
   * - Nếu không, thêm URL cơ sở API vào trước để tạo URL đầy đủ
   *
   * @param image - URL hình ảnh từ API
   * @returns Chuỗi URL hình ảnh đã định dạng
   */
  private formatCategoryImage(image: string | null | undefined): string {
    // Nếu hình ảnh là null hoặc undefined, trả về đường dẫn hình ảnh mặc định
    if (!image) {
      return 'assets/img/categories/default-category.jpg';
    }

    // Kiểm tra xem hình ảnh đã có URL đầy đủ chưa (bắt đầu bằng http)
    return image.startsWith('http')
      ? image  // Nếu là URL đầy đủ, sử dụng nguyên bản
      : `${environment.apiBaseUrl}/categories/images/${image}`;  // Nếu không, thêm vào URL cơ sở API
  }

  /**
   * Phát ra sự kiện khi một danh mục được nhấp vào
   * @param categoryId - ID của danh mục được nhấp
   */
  onCategoryClick(categoryId: number): void {
    this.categoryClick.emit(categoryId);
  }
}
