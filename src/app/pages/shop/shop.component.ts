import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Sử dụng setTimeout để đảm bảo JavaScript chạy sau khi DOM đã tải
    setTimeout(() => {
      this.initializeShopJS();
    }, 0);
  }

  initializeShopJS(): void {
    // Kiểm tra xem jQuery đã được định nghĩa chưa
    if (typeof (window as any).$ !== 'undefined') {
      const $ = (window as any).$;

      // Price Range Slider
      if ($('.price-range').length) {
        $('.price-range').slider({
          range: true,
          min: 10,
          max: 540,
          values: [10, 540],
          slide: function (event: any, ui: any) {
            $('#minamount').val('$' + ui.values[0]);
            $('#maxamount').val('$' + ui.values[1]);
          }
        });
        $('#minamount').val('$' + $('.price-range').slider("values", 0));
        $('#maxamount').val('$' + $('.price-range').slider("values", 1));
      }

      // Product Discount Slider
      if ($('.product__discount__slider').length) {
        $('.product__discount__slider').owlCarousel({
          loop: true,
          margin: 0,
          items: 3,
          dots: true,
          smartSpeed: 1200,
          autoplay: true,
          autoplayTimeout: 1500,
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

      // Latest Product Slider
      if ($('.latest-product__slider').length) {
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
}

