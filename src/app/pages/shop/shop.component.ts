import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {LatestProductSliderComponent} from "../../shared/latest-product-slider/latest-product-slider.component";
import {ProductDiscountSliderComponent} from "../../shared/product-discount-slider/product-discount-slider.component";
import {FooterComponent} from "../../shared/footer/footer.component";
import {HeaderComponent} from "../../shared/header/header.component";

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink, LatestProductSliderComponent, ProductDiscountSliderComponent, LatestProductSliderComponent, ProductDiscountSliderComponent, FooterComponent, HeaderComponent],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Sử dụng setTimeout để đảm bảo JavaScript chạy sau khi DOM đã tải
      setTimeout(() => {
        this.initializeShopJS();
      }, 0);
    }
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
    }
  }
}
