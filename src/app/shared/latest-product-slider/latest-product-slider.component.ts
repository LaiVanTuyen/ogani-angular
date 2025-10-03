import { Component, OnInit, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { ProductSliderBaseComponent } from '../base/product-slider-base.component';

declare var $: any;

@Component({
  selector: 'app-latest-product-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './latest-product-slider.component.html'
})
export class LatestProductSliderComponent extends ProductSliderBaseComponent implements OnInit {
  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    elementRef: ElementRef,
    productService: ProductService
  ) {
    super(platformId, elementRef, productService);
  }

  override fetchProducts(): void {
    this.handleApi(() => this.productService.getLatestProducts(this.keyword, this.categoryId, this.currentPage - 1, this.pageSize));
  }
}
