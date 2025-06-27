import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {Category} from "../../models/category";
import {CategoryService} from "../../services/category.service";
import {RouterLink} from "@angular/router";
import {environment} from "../../../environments/environment.development";

declare var $: any;

@Component({
  selector: 'app-categories-slider',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories-slider.component.html'
})
export class CategoriesSliderComponent implements OnInit {
  categories: Category[] = []; // Dữ liệu động từ categoryService

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private categoryService: CategoryService) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeSlider();
      }, 0);
    }
    this.getCategories(0, 100);
  }

  initializeSlider(): void {
    if (typeof $ !== 'undefined' && $('.categories__slider').length) {
      $('.categories__slider').owlCarousel({
        loop: true,
        margin: 0,
        items: 4,
        dots: false,
        nav: true,
        navText: ["<span class='fa fa-angle-left'><span/>", "<span class='fa fa-angle-right'><span/>"],
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        responsive: {
            0: {
                items: 1,
            },
            480: {
                items: 2,
            },
            768: {
                items: 3,
            },
            992: {
                items: 4,
            }
        }
      });
    }
  }

  private getCategories(page: number, limit: number) {
    this.categoryService.getCategories(page, limit).subscribe({
      next: (categories: Category[]) => {
        categories.forEach(category => {
          // Kiểm tra nếu image tồn tại và không phải null hoặc undefined
          if (category.image) {
            // Kiểm tra nếu image đã chứa URL đầy đủ thì không thêm prefix
            if (!category.image.startsWith('http')) {
              category.image = `${environment.apiBaseUrl}/categories/images/${category.image}`;
            }
          } else {
            // Nếu không có ảnh, gán ảnh mặc định
            category.image = 'assets/img/categories/default-category.jpg';
          }
        })
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

