import { Component, OnInit, Inject, PLATFORM_ID, Input, ElementRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { ProductSliderBaseComponent } from '../base/product-slider-base.component';
import { RouterModule } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-home-product-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-product-slider.component.html',
})
export class HomeProductSliderComponent extends ProductSliderBaseComponent implements OnInit {
  /**
   * Tiêu đề của slider
   */
  @Input() title: string = '';

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    elementRef: ElementRef,
    productService: ProductService
  ) {
    super(platformId, elementRef, productService);
  }

  /**
   * Hàm ghi đè để gọi API phù hợp dựa trên tiêu đề
   */
  override fetchProducts(): void {
    if (this.title === 'Latest Products') {
      this.handleApi(() => this.productService.getLatestProducts(this.keyword, this.categoryId, this.currentPage - 1, this.pageSize));
    } else if (this.title === 'Top Rated Products') {
      this.handleApi(() => this.productService.getTopRatedProducts(this.currentPage - 1, this.pageSize));
    } else if (this.title === 'Top Sales Products') {
      this.handleApi(() => this.productService.getTopSalesProducts(this.currentPage - 1, this.pageSize));
    }
  }
}
