import { Directive, Inject, PLATFORM_ID, ElementRef, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { of } from 'rxjs';

// Base directive for product sliders
@Directive()
export abstract class ProductSliderBaseComponent implements OnInit {
  products: Product[] = [];
  productGroups: Product[][] = [];
  currentPage = 1;
  pageSize = 12;
  keyword = '';
  categoryId = 0;

  constructor(
    @Inject(PLATFORM_ID) protected platformId: Object,
    protected elementRef: ElementRef,
    protected productService: ProductService
  ) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  abstract fetchProducts(): void;

  protected initializeSlider(): void {
    if (typeof window !== 'undefined' && typeof (window as any).$ !== 'undefined') {
      const $ = (window as any).$;
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

  protected formatProducts(products: any[]): Product[] {
    return products.map((product: Product) => ({
      ...product,
      thumbnail: `${environment.apiBaseUrl}/products/images/${product.thumbnail}`,
      product_images: product.product_images.map(image => ({
        ...image,
        image_url: `${environment.apiBaseUrl}/products/images/${image.image_url}`
      }))
    }));
  }

  protected groupProducts(products: Product[], groupSize: number): Product[][] {
    const groups = [];
    for (let i = 0; i < products.length; i += groupSize) {
      groups.push(products.slice(i, i + groupSize));
    }
    return groups;
  }

  protected handleApi(apiCall: () => any): void {
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
}

