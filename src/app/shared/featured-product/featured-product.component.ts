import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-featured-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-product.component.html'
})
export class FeaturedProductComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeMixItUp();
      }, 0);
    }
  }

  initializeMixItUp(): void {
    if (typeof (window as any).$ !== 'undefined' && (window as any).$('.featured__controls').length) {
      const $ = (window as any).$;
      (window as any).mixitup('.featured__filter', {
        selectors: {
          target: '.mix'
        },
        animation: {
          duration: 300
        }
      });

      $('.featured__controls li').on('click', (event: any) => {
        $('.featured__controls li').removeClass('active');
        $(event.currentTarget).addClass('active');
      });
    }
  }
}
