import {Component} from '@angular/core';
import {Button} from 'primeng/button';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {DropdownModule} from 'primeng/dropdown';
import {FormsModule} from '@angular/forms';
import {Language} from '../../interfaces/language';
import {Select} from 'primeng/select';
import {ToggleSwitch} from "primeng/toggleswitch";
import {NgClass} from "@angular/common";
import {ThemeService} from "../../services/theme.service";

@Component({
  selector: 'app-head',
  imports: [
    Button,
    TranslatePipe,
    DropdownModule,
    FormsModule,
    Select,
    ToggleSwitch,
    NgClass
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
  isDarkTheme: any;

  constructor(private translate: TranslateService,
              private themeService: ThemeService,) {
    const storedLanguage = localStorage.getItem('language');
    this.selectedLanguage = storedLanguage
      ? (JSON.parse(storedLanguage) as Language)
      : { language: 'UA' };

    this.translate.use(this.selectedLanguage.language.toLowerCase());
    this.isDarkTheme = this.themeService['isDarkTheme']
  }

  changeLanguage(): void {
    this.translate.use(this.selectedLanguage.language.toLowerCase());
    localStorage.setItem('language', JSON.stringify(this.selectedLanguage));
  }

  onThemeToggle() {
    this.themeService.toggleTheme();
  }
}
