import {Component, ViewChild} from '@angular/core';
import {Button} from 'primeng/button';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {DropdownModule} from 'primeng/dropdown';
import {FormsModule} from '@angular/forms';
import {Language} from '../../interfaces/language';
import {Select} from 'primeng/select';
import {ToggleSwitch} from "primeng/toggleswitch";
import {NgClass} from "@angular/common";
import {ThemeService} from "../../services/theme.service";
import {GenerateRsaKeypairComponent} from './generate-rsa-keypair/generate-rsa-keypair.component';
import {Dialog} from 'primeng/dialog';
import {Tooltip} from 'primeng/tooltip';

@Component({
  selector: 'app-head',
  imports: [
    Button,
    TranslatePipe,
    DropdownModule,
    FormsModule,
    Select,
    ToggleSwitch,
    NgClass,
    GenerateRsaKeypairComponent,
    Dialog,
    Tooltip,
  ],
  templateUrl: './head.component.html',
  styleUrl: './head.component.scss'
})
export class HeadComponent {
  @ViewChild('generateRSAKeyPairComponent') generateRsaKeypairComponent: GenerateRsaKeypairComponent | undefined;
  electron: any = (window as any).electron;
  languages: Language[] = [
    {language: "UA"},
    {language: "EN"}
  ];
  selectedLanguage: Language;
  isDarkTheme: any;
  isHelpModalVisible: boolean = false;

  constructor(private readonly translate: TranslateService,
              private readonly themeService: ThemeService,) {
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

  generateRSAKeyPair() {
    this.generateRsaKeypairComponent!.open();
  }

  openKeysFolder() {
    this.electron.send('open-keys-folder', null);
  }

  showHelp() {
    this.isHelpModalVisible = true;
  }
}
