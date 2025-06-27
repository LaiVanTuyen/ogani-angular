import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import {isPlatformBrowser, CommonModule, DOCUMENT} from '@angular/common';
import {HeaderComponent} from "../../shared/header/header.component";
import {FooterComponent} from "../../shared/footer/footer.component";
import { CategoriesSliderComponent } from '../../shared/categories-slider/categories-slider.component';
import { FeaturedProductComponent } from '../../shared/featured-product/featured-product.component';
import {
  HomeLatestProductSliderComponent
} from "../../shared/home-latest-product-slider/home-latest-product-slider.component";
import {Router, RouterLink} from "@angular/router";
import {CategoryService} from "../../services/category.service";
import {Category} from "../../models/category";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, CategoriesSliderComponent, FeaturedProductComponent, HomeLatestProductSliderComponent, HomeLatestProductSliderComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  categories: Category[] = []; // Dữ liệu động từ categoryService
  selectedCategoryId: number  = 0; // Giá trị category được chọn
  keyword:string = "";
  localStorage?:Storage;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private categoryService: CategoryService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.localStorage = document.defaultView?.localStorage;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Sử dụng setTimeout để đảm bảo JavaScript chạy sau khi DOM đã tải
      setTimeout(() => {
        this.initializeHomeJS();
      }, 0);
    }
    this.getCategories(0, 100);
  }

  initializeHomeJS() {
      const $ = (window as any).$;
      if (isPlatformBrowser(this.platformId)) {
          $('.hero__categories__all').on('click', function(){
              $('.hero__categories ul').slideToggle(400);
          });
      }
  }


  private getCategories(page: number, limit: number) {
    this.categoryService.getCategories(page, limit).subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
      },
      complete: () => {
        debugger;
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
  }
}
