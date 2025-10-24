import { Component, OnInit, Inject, PLATFORM_ID, ElementRef, Input } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ProductImage } from '../../models/product.image';

declare var $: any;

@Component({
  selector: 'app-product-details-pic-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details-pic-slider.component.html'
})
export class ProductDetailsPicSliderComponent implements OnInit {
  @Input() productImages: ProductImage[] = [];

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
    const $el = $(this.elementRef.nativeElement);

    if (typeof $ !== 'undefined') {
      const slider = $el.find('.product__details__pic__slider');
      if (slider.length) {
        slider.owlCarousel({
          loop: true,
          margin: 20,
          items: 4,
          dots: true,
          smartSpeed: 1200,
          autoHeight: false,
          autoplay: true
        });
      }

      $el.find('.product__details__pic__slider img').on('click', (event: any) => {
        const imgUrl = $(event.currentTarget).data('imgbigurl');
        const bigImg = $el.parent().find('.product__details__pic__item--large');
        if (imgUrl !== bigImg.attr('src')) {
          bigImg.attr({
            src: imgUrl
          });
        }
      });
    }
  }
}
