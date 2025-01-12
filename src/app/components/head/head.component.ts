import {Component} from '@angular/core';
import {Button} from 'primeng/button';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {DropdownModule} from 'primeng/dropdown';
import {FormsModule} from '@angular/forms';
import {Language} from '../../interfaces/language';
import {Select} from 'primeng/select';

@Component({
  selector: 'app-head',
  imports: [
    Button,
    TranslatePipe,
    DropdownModule,
    FormsModule,
    Select
  ],
  templateUrl: './head.component.html',
  styleUrl: './head.component.css'
})
export class HeadComponent {
  languages: Language[] = [
    {language: "UA"},
    {language: "EN"}
  ];
  selectedLanguage: Language;

  constructor(private translate: TranslateService) {
    const storedLanguage = localStorage.getItem('language');
    this.selectedLanguage = storedLanguage
      ? (JSON.parse(storedLanguage) as Language)
      : { language: 'UA' };

    this.translate.use(this.selectedLanguage.language);
  }

  changeLanguage(): void {
    this.translate.use(this.selectedLanguage.language);
    localStorage.setItem('language', JSON.stringify(this.selectedLanguage));
  }
}
