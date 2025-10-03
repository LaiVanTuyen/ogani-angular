import { Component, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { ProductSliderBaseComponent } from '../base/product-slider-base.component';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { map, catchError, of } from 'rxjs';

@Component({
  selector: 'app-product-discount-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-discount-slider.component.html'
})
export class ProductDiscountSliderComponent extends ProductSliderBaseComponent {
  categories: { [id: number]: string } = {};

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    elementRef: ElementRef,
    productService: ProductService,
    private categoryService: CategoryService
  ) {
    super(platformId, elementRef, productService);
  }

  override fetchProducts(): void {
    this.handleApi(() => this.productService.getTopSalesProducts(this.currentPage - 1, this.pageSize));
  }

  override handleApi(apiCall: () => any): void {
    apiCall().pipe(
      map((response: any) => {
        const products = Array.isArray(response) ? response : (response.products || []);
        return this.formatProducts(products);
      }),
      catchError((error: any) => {
        console.error('Error fetching products:', error);
        return of([]);
      })
    ).subscribe({
      next: (products: any[]) => {
        this.products = products;
        this.productGroups = this.groupProducts(this.products, 3);
        // Lấy tên category cho từng sản phẩm
        this.products.forEach(product => {
          if (product.category_id && !this.categories[product.category_id]) {
            this.categoryService.getDetailCategory(product.category_id).subscribe(category => {
              this.categories[product.category_id] = category.name;
            });
          }
        });
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

  override initializeSlider(): void {
    if (typeof window !== 'undefined' && typeof (window as any).$ !== 'undefined') {
      const $ = (window as any).$;
      const slider = $(this.elementRef.nativeElement).find('.product__discount__slider');
      if (slider.length) {
        slider.owlCarousel({
          loop: true,
          margin: 0,
          items: 3,
          dots: true,
          smartSpeed: 2000,
          autoplay: true,
          autoplayTimeout: 5000,
          responsive: {
            320: { items: 1 },
            480: { items: 2 },
            768: { items: 2 },
            992: { items: 3 }
          }
        });
      }
    }
  }
}
