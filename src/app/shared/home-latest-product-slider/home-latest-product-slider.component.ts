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
  selector: 'app-home-latest-product-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-latest-product-slider.component.html'
})
export class HomeLatestProductSliderComponent implements OnInit {
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
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeSlider();
      }, 0);
    }
    if (this.title === 'Latest Products'){
      this.getLatestProducts(this.keyword, this.categoryId, this.currentPage - 1, this.pageSize);
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

  getLatestProducts(keyword: string, categoryId: number, number: number, pageSize: number) {
    this.productService.getLatestProducts(keyword, categoryId, number, pageSize).pipe(
      map((response: any) => {
        const products = response.products || [];
        return products.map((product: Product) => {
          return {
            ...product,
            thumbnail: `${environment.apiBaseUrl}/products/images/${product.thumbnail}`,
            product_images: product.product_images.map(image => ({
              ...image,
              image_url: `${environment.apiBaseUrl}/products/images/${image.image_url}`
            }))
          };
        });
      }),
      catchError(error => {
        console.error('Error fetching featured products:', error);
        return of([]);
      })
    ).subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.productGroups = this.groupProducts(this.products, 3);
      },
      error: (error) => {
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
