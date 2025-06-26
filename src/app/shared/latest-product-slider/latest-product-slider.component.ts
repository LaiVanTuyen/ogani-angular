import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-latest-product-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './latest-product-slider.component.html'
})
export class LatestProductSliderComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeSlider();
      }, 0);
    }
  }

  initializeSlider(): void {
    if (typeof $ !== 'undefined' && $('.latest-product__slider').length) {
        $('.latest-product__slider').owlCarousel({
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

