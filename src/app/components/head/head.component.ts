import {Component, OnInit, ViewChild} from '@angular/core';
import {Button} from 'primeng/button';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {DropdownModule} from 'primeng/dropdown';
import {FormsModule} from '@angular/forms';
import {Language} from '../../interfaces/language';
import {Select} from 'primeng/select';
import {ToggleSwitch} from "primeng/toggleswitch";
import {NgClass, NgIf} from "@angular/common";
import {ThemeService} from "../../services/theme.service";
import {GenerateRsaKeypairComponent} from './generate-rsa-keypair/generate-rsa-keypair.component';
import {Dialog} from 'primeng/dialog';
import {Tooltip} from 'primeng/tooltip';
import {KeyPairsService} from '../../services/key-pairs.service';

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
    NgIf,
  ],
  templateUrl: './head.component.html',
  styleUrl: './head.component.scss'
})
export class HeadComponent implements OnInit {
  @ViewChild('generateRSAKeyPairComponent') generateRsaKeypairComponent?: GenerateRsaKeypairComponent;
  electron: any = (window as any).electron;
  languages: Language[] = [
    {language: "UA"},
    {language: "EN"}
  ];
  selectedLanguage: Language;
  isDarkTheme: any;
  isHelpModalVisible: boolean = false;
  isKeysFolderExists: boolean = false;

  constructor(private readonly translate: TranslateService,
              private readonly themeService: ThemeService,
              private readonly keyPairsService: KeyPairsService) {
    const storedLanguage = localStorage.getItem('language');
    this.selectedLanguage = storedLanguage
      ? (JSON.parse(storedLanguage) as Language)
      : { language: 'UA' };

    this.translate.use(this.selectedLanguage.language.toLowerCase());
    this.isDarkTheme = this.themeService['isDarkTheme']
  }

  ngOnInit(): void {
    this.keyPairsService.isKeysFolderExists$.subscribe(value => {
      this.isKeysFolderExists = value;
    });

    this.keyPairsService.checkKeysFolderExisting();
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

  zoomOut() {
    this.electron.zoomOut()
      .then((updatedZoom: number) => {
        localStorage.setItem('zoom', updatedZoom.toString());
      });
  }

  zoomIn() {
    this.electron.zoomIn()
      .then((updatedZoom: number) => {
        localStorage.setItem('zoom', updatedZoom.toString());
      });
  }
}
