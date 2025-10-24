import {Component, OnInit, Inject, PLATFORM_ID, AfterViewInit, OnDestroy} from '@angular/core';
import {isPlatformBrowser, CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {HeaderComponent} from "../../shared/header/header.component";
import {FooterComponent} from "../../shared/footer/footer.component";
import {
  ProductDetailsPicSliderComponent
} from "../../shared/product-details-pic-slider/product-details-pic-slider.component";
import {FormsModule} from '@angular/forms';
import {ProductService} from "../../services/product.service";
import {ActivatedRoute} from "@angular/router";
import {Product} from "../../models/product";
import {environment} from "../../../environments/environment";
import {CommentStats} from "../../models/comment-stats";
import {CommentService} from "../../services/comment.service";
import {forkJoin} from 'rxjs';
import {Subject, of} from 'rxjs';
import {switchMap, takeUntil, catchError, map, filter} from 'rxjs/operators';

@Component({
  selector: 'app-shop-details',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent, ProductDetailsPicSliderComponent, FormsModule],
  templateUrl: './shop-details.component.html',
  styleUrls: ['./shop-details.component.scss'],
  host: {
    'ngSkipHydration': 'true',
  }
})
export class ShopDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  // add OnDestroy via Subject
  private destroy$ = new Subject<void>();
  rating: number = 0;
  hoveredRating: number = 0;
  product?: Product;
  private productId: number = 0;
  commentStats?: CommentStats[];
  // precomputed for template
  starTypes: ('full' | 'half' | 'empty')[] = ['empty', 'empty', 'empty', 'empty', 'empty'];
  displayedReviewCount: number = 0;
  loading: boolean = false;
  errorMessage?: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private productService: ProductService,
    private commentService: CommentService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      filter(id => !!id),
      takeUntil(this.destroy$),
      switchMap(id => {
        this.productId = id;
        this.loading = true;
        this.errorMessage = undefined;
        return forkJoin({
          product: this.productService.getDetailProduct(this.productId),
          stats: this.commentService.getCommentCountsGroupedByProduct(this.productId)
        }).pipe(
          catchError(err => {
            // capture error and return fallbacks so outer stream continues
            console.error('Error fetching product or comment stats:', err);
            this.errorMessage = 'Không thể tải dữ liệu sản phẩm.';
            this.loading = false;
            return of({product: null as any, stats: [] as CommentStats[]});
          })
        );
      })
    ).subscribe(({product, stats}) => {
      this.loading = false;
      if (product) {
        this.product = product;
        if (this.product && this.product.product_images) {
          this.product.product_images.forEach(image => {
            image.image_url = `${environment.apiBaseUrl}/products/images/${image.image_url}`;
          });
        }
      }

      this.commentStats = stats ?? [];
      const stat = this.commentStats?.find(s => s.productId === this.productId) ?? this.commentStats?.[0];
      if (stat && this.product) {
        this.product.avgRating = stat.avgRating;
        this.product.reviewCount = stat.commentCount;
        this.displayedReviewCount = stat.commentCount ?? 0;
      } else if (this.product) {
        this.displayedReviewCount = this.product.reviewCount ?? 0;
      } else {
        this.displayedReviewCount = stat?.commentCount ?? 0;
      }

      const avg = this.product?.avgRating ?? (stat?.avgRating ?? 0);
      this.starTypes = this.computeStarTypes(avg);

      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.initializeShopDetailsJS(), 0);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Tính mảng kiểu sao (full|half|empty) cho 5 sao dựa trên avg (1..5)
  computeStarTypes(avg: number): ('full' | 'half' | 'empty')[] {
    const types: ('full' | 'half' | 'empty')[] = [];
    const floor = Math.floor(avg);
    const frac = avg - floor;
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        types.push('full');
      } else if (i === floor + 1 && frac >= 0.5) {
        types.push('half');
      } else {
        types.push('empty');
      }
    }
    return types;
  }

  setRating(rating: number): void {
    this.rating = rating;
  }

  hoverRating(rating: number): void {
    this.hoveredRating = rating;
  }

  resetRating(): void {
    this.hoveredRating = 0;
  }

  ngAfterViewInit(): void {
    // The call is moved to ngOnInit's subscribe block to ensure DOM is ready.
  }

  initializeShopDetailsJS(): void {
    // Kiểm tra xem jQuery đã được định nghĩa chưa
    if (typeof (window as any).$ !== 'undefined') {
      const $ = (window as any).$;

      // Product Details Slider
      if ($('.product__details__pic__slider').length) {
        $('.product__details__pic__slider').owlCarousel({
          loop: true,
          margin: 20,
          items: 4,
          dots: true,
          smartSpeed: 1200,
          autoplay: true,
          autoplayTimeout: 5000,
          responsive: {
            0: {
              items: 2
            },
            480: {
              items: 3
            },
            768: {
              items: 4
            }
          }
        });

        // Change main image on thumbnail click
        $('.product__details__pic__slider img').on('click', function (this: HTMLElement) {
          var imgurl = $(this).data('imgbigurl');
          $('.product__details__pic__item--large').attr({
            src: imgurl
          });
        });
      }

      // Pro Quantity
      $('.pro-qty').each(function (this: HTMLElement) {
        $(this).prepend('<span class="dec qtybtn">-</span>');
        $(this).append('<span class="inc qtybtn">+</span>');
      });

      $('.qtybtn').on('click', function (this: HTMLElement) {
        const $button = $(this);
        const oldValue = $button.parent().find('input').val() as string;

        let newVal: number;
        if ($button.hasClass('inc')) {
          newVal = parseFloat(oldValue) + 1;
        } else {
          // Don't allow decrementing below zero
          if (parseFloat(oldValue) > 0) {
            newVal = parseFloat(oldValue) - 1;
          } else {
            newVal = 0;
          }
        }

        $button.parent().find('input').val(newVal);
      });

      // Bootstrap tabs initialization
      $('ul.nav-tabs a').click(function (this: HTMLElement, e: Event) {
        e.preventDefault();
        $(this).tab('show');
      });
    }
  }
}
