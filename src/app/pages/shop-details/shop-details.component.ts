import { Component, OnInit, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {HeaderComponent} from "../../shared/header/header.component";
import {FooterComponent} from "../../shared/footer/footer.component";
import {
  ProductDetailsPicSliderComponent
} from "../../shared/product-details-pic-slider/product-details-pic-slider.component";
import { FormsModule } from '@angular/forms';

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
export class ShopDetailsComponent implements OnInit, AfterViewInit {
  rating: number = 0;
  hoveredRating: number = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
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
    if (isPlatformBrowser(this.platformId)) {
      this.initializeShopDetailsJS();
    }
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
        $('.product__details__pic__slider img').on('click', function(this: HTMLElement) {
          var imgurl = $(this).data('imgbigurl');
          $('.product__details__pic__item--large').attr({
            src: imgurl
          });
        });
      }

      // Pro Quantity
      $('.pro-qty').each(function(this: HTMLElement) {
        $(this).prepend('<span class="dec qtybtn">-</span>');
        $(this).append('<span class="inc qtybtn">+</span>');
      });

      $('.qtybtn').on('click', function(this: HTMLElement) {
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
      $('ul.nav-tabs a').click(function(this: HTMLElement, e: Event) {
        e.preventDefault();
        $(this).tab('show');
      });
    }
  }
}
