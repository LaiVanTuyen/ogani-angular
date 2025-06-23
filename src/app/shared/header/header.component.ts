import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Sử dụng setTimeout để đảm bảo JavaScript chạy sau khi DOM đã tải
    setTimeout(() => {
      this.initializeMenus();
    }, 0);
  }

  initializeMenus() {
    if (typeof window !== 'undefined') {
      // Kiểm tra xem jQuery đã được định nghĩa chưa
      if (typeof (window as any).$ !== 'undefined') {
        const $ = (window as any).$;

        // Mobile Menu
        $('.mobile-menu').slicknav({
          prependTo: '#mobile-menu-wrap',
          allowParentLinks: true
        });

        // Humberger Menu
        $(".humberger__open").on('click', function(this: HTMLElement) {
          $(".humberger__menu__wrapper").addClass("show__humberger__menu__wrapper");
          $(".humberger__menu__overlay").addClass("active");
          $("body").addClass("over_hid");
        });

        $(".humberger__menu__overlay").on('click', function(this: HTMLElement) {
          $(".humberger__menu__wrapper").removeClass("show__humberger__menu__wrapper");
          $(".humberger__menu__overlay").removeClass("active");
          $("body").removeClass("over_hid");
        });
      }
    }
  }
}
