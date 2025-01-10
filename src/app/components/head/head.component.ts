import { Component } from '@angular/core';
import {Button} from 'primeng/button';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-head',
  imports: [
    Button,
    TranslatePipe
  ],
  templateUrl: './head.component.html',
  styleUrl: './head.component.css'
})
export class HeadComponent {
  constructor(private translate: TranslateService) {
    const savedLanguage = localStorage.getItem('language') || 'uk';
    this.translate.use(savedLanguage);
  }

  changeLanguage(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const language = selectElement.value;
    this.translate.use(language);
    localStorage.setItem('language', language);
  }
}
