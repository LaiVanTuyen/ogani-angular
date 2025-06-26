import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {HeaderComponent} from "../../shared/header/header.component";
import {FooterComponent} from "../../shared/footer/footer.component";
import { CategoriesSliderComponent } from '../../shared/categories-slider/categories-slider.component';
import { FeaturedProductComponent } from '../../shared/featured-product/featured-product.component';
import {
  HomeLatestProductSliderComponent
} from "../../shared/home-latest-product-slider/home-latest-product-slider.component";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, CategoriesSliderComponent, FeaturedProductComponent, HomeLatestProductSliderComponent, HomeLatestProductSliderComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Sử dụng setTimeout để đảm bảo JavaScript chạy sau khi DOM đã tải
      setTimeout(() => {
        this.initializeHomeJS();
      }, 0);
    }
  }

  initializeHomeJS() {
      const $ = (window as any).$;
      if (isPlatformBrowser(this.platformId)) {
          $('.hero__categories__all').on('click', function(){
              $('.hero__categories ul').slideToggle(400);
          });
      }
  }
}
