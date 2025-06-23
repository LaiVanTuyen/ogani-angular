import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Sử dụng setTimeout để đảm bảo JavaScript chạy sau khi DOM đã tải
    setTimeout(() => {
      this.initializeCartJS();
    }, 0);
  }

  initializeCartJS(): void {
    // Kiểm tra xem jQuery đã được định nghĩa chưa
    if (typeof (window as any).$ !== 'undefined') {
      const $ = (window as any).$;

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
    }
  }
}

