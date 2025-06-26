import { Component, OnInit, Inject, PLATFORM_ID, Input, ElementRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-home-latest-product-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-latest-product-slider.component.html'
})
export class HomeLatestProductSliderComponent implements OnInit {
  @Input() title: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeSlider();
      }, 0);
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
}

