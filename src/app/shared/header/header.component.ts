import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    // Only run client-side code when in browser environment
    if (isPlatformBrowser(this.platformId)) {
      // Using setTimeout to ensure JavaScript runs after DOM is loaded
      setTimeout(() => {
        this.initializeMenus();
      }, 0);
    }
  }

  initializeMenus() {
    if (typeof window !== 'undefined') {
      // Check if jQuery is defined
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
