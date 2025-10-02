import { Component, OnInit, Inject, PLATFORM_ID, Input, ElementRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {Product} from "../../models/product";
import {ProductService} from "../../services/product.service";
import {catchError, map} from "rxjs/operators";
import {environment} from "../../../environments/environment.development";
import {of} from "rxjs";
import {RouterModule} from "@angular/router";

declare var $: any;

@Component({
  selector: 'app-home-product-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-product-slider.component.html'
})
export class HomeProductSliderComponent implements OnInit {
  /**
   * Mảng lưu trữ dữ liệu sản phẩm được lấy từ API
   */
  products: Product[] = [];
  productGroups: Product[][] = [];
  currentPage = 1;
  pageSize = 12;
  keyword = '';
  categoryId = 0;
  /**
   * Tiêu đề của slider
   */
  @Input() title: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private elementRef: ElementRef,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    if (this.title === 'Latest Products') {
      this.fetchProducts(() => this.productService.getLatestProducts(this.keyword, this.categoryId, this.currentPage - 1, this.pageSize));
    } else if (this.title === 'Top Rated Products') {
      this.fetchProducts(() => this.productService.getTopRatedProducts(this.currentPage - 1, this.pageSize));
    }
  }

  initializeSlider(): void {
    if (typeof $ !== 'undefined') {
      const slider = $(this.elementRef.nativeElement).find('.latest-product__slider');
      if (slider.length) {
        slider.owlCarousel({
          loop: true,
          margin: 0,
          items: 1,
          dots: false,
          nav: true,
          navText: ["<span class='fa fa-angle-left'></span>", "<span class='fa fa-angle-right'></span>"],
          smartSpeed: 1200,
          autoHeight: false,
          autoplay: true
        });
      }
    }
  }

  /**
   * Hàm xử lý dữ liệu sản phẩm trả về từ API
   */
  private formatProducts(products: any[]): Product[] {
    return products.map((product: Product) => ({
      ...product,
      thumbnail: `${environment.apiBaseUrl}/products/images/${product.thumbnail}`,
      product_images: product.product_images.map(image => ({
        ...image,
        image_url: `${environment.apiBaseUrl}/products/images/${image.image_url}`
      }))
    }));
  }

  /**
   * Hàm dùng chung để lấy và xử lý sản phẩm, sau đó khởi tạo slider
   */
  private fetchProducts(apiCall: () => any): void {
    apiCall().pipe(
      map((response: any) => {
        // console.log('API response:', response); // Bỏ log nếu không cần debug
        const products = Array.isArray(response) ? response : (response.products || []);
        return this.formatProducts(products);
      }),
      catchError((error: any) => {
        console.error('Error fetching products:', error);
        return of([]);
      })
    ).subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.productGroups = this.groupProducts(this.products, 3);
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            this.initializeSlider();
          }, 0);
        }
      },
      error: (error: any) => {
        console.error('Subscription error:', error);
      }
    });
  }

  groupProducts(products: Product[], groupSize: number): Product[][] {
    const groups = [];
    for (let i = 0; i < products.length; i += groupSize) {
      groups.push(products.slice(i, i + groupSize));
    }
    return groups;
  }
}
