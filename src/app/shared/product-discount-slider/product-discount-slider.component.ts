import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-product-discount-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-discount-slider.component.html'
})
export class ProductDiscountSliderComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeSlider();
      }, 0);
    }
  }

  initializeSlider(): void {
    if (typeof $ !== 'undefined' && $('.product__discount__slider').length) {
      $('.product__discount__slider').owlCarousel({
        loop: true,
        margin: 0,
        items: 3,
        dots: true,
        smartSpeed: 2000,
        autoplay: true,
        autoplayTimeout: 5000,
        responsive: {
          320: {
            items: 1,
          },
          480: {
            items: 2,
          },
          768: {
            items: 2,
          },
          992: {
            items: 3,
          }
        }
      });
    }
  }
}
