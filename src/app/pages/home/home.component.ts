import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Sử dụng setTimeout để đảm bảo JavaScript chạy sau khi DOM đã tải
    setTimeout(() => {
      this.initializeHomeJS();
    }, 0);
  }

  initializeHomeJS() {
    if (typeof window !== 'undefined') {
      const $ = (window as any).$;
      const owlCarousel = (window as any).owlCarousel;

      // Categories Slider
      if ($('.categories__slider').length) {
        $('.categories__slider').owlCarousel({
          loop: true,
          margin: 0,
          items: 4,
          dots: false,
          nav: true,
          navText: ["<span class='fa fa-angle-left'></span>", "<span class='fa fa-angle-right'></span>"],
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

      // Featured products filter
      if ($('.featured__controls').length) {
        const mixer = (window as any).mixitup('.featured__filter', {
          selectors: {
            target: '.mix'
          },
          animation: {
            duration: 300
          }
        });
      }
    }
  }
}
