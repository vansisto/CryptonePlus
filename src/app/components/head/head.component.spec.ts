import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HeadComponent } from './head.component';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../services/theme.service';
import { KeyPairsService } from '../../services/key-pairs.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Dialog } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { GenerateRsaKeypairComponent } from './generate-rsa-keypair/generate-rsa-keypair.component';
import { Tooltip } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

class MockTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<any> {
    return of({
      'GENERATE_KEY_PAIR': 'Generate Key Pair',
      'HELP_TEXT': 'Help Text Content',
      'TOOLTIPS.SHOW_INFO': 'Show Info'
    });
  }
}

describe('HeadComponent', () => {
  let component: HeadComponent;
  let fixture: ComponentFixture<HeadComponent>;
  let mockKeyPairsService: jasmine.SpyObj<KeyPairsService>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let translateService: TranslateService;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(async () => {
    mockLocalStorage = {};
    spyOn(localStorage, 'getItem').and.callFake(key => mockLocalStorage[key]);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => mockLocalStorage[key] = value);

    mockKeyPairsService = jasmine.createSpyObj('KeyPairsService',
      ['checkKeysFolderExisting'],
      {
        isKeysFolderExists$: of(true)
      }
    );

    mockThemeService = jasmine.createSpyObj('ThemeService',
      ['toggleTheme'],
      {
        isDarkTheme: true
      }
    );

    mockMessageService = jasmine.createSpyObj('MessageService', ['add', 'clear']);

    (window as any).electron = {
      send: jasmine.createSpy('send'),
      zoomIn: jasmine.createSpy('zoomIn').and.returnValue(Promise.resolve(1.1)),
      zoomOut: jasmine.createSpy('zoomOut').and.returnValue(Promise.resolve(0.9))
    };

    await TestBed.configureTestingModule({
      imports: [
        HeadComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        }),
        NoopAnimationsModule,
        FormsModule,
        Button,
        Select,
        ToggleSwitch,
        Dialog,
        Tooltip,
        GenerateRsaKeypairComponent
      ],
      providers: [
        { provide: KeyPairsService, useValue: mockKeyPairsService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeadComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as any).electron;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default language if none stored', () => {
      expect(component.selectedLanguage.language).toBe('UA');
      expect(translateService.currentLang).toBe('ua');
    });

    it('should load stored language from localStorage', () => {
      mockLocalStorage['language'] = JSON.stringify({ language: 'EN' });
      fixture = TestBed.createComponent(HeadComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.selectedLanguage.language).toBe('EN');
      expect(translateService.currentLang).toBe('en');
    });

    it('should check for keys folder existence on init', () => {
      expect(mockKeyPairsService.checkKeysFolderExisting).toHaveBeenCalled();
      expect(component.isKeysFolderExists).toBeTrue();
    });
  });

  describe('Language handling', () => {
    it('should change language', () => {
      component.selectedLanguage = { language: 'EN' };
      component.changeLanguage();

      expect(translateService.currentLang).toBe('en');
      expect(localStorage.setItem).toHaveBeenCalledWith('language', JSON.stringify({ language: 'EN' }));
    });
  });

  describe('Theme handling', () => {
    it('should toggle theme', () => {
      component.onThemeToggle();
      expect(mockThemeService.toggleTheme).toHaveBeenCalled();
    });
  });

  describe('Key pair operations', () => {
    it('should open key pair generator', () => {
      const generateRsaKeypairComponent = jasmine.createSpyObj('GenerateRsaKeypairComponent', ['open']);
      component.generateRsaKeypairComponent = generateRsaKeypairComponent;

      component.generateRSAKeyPair();
      expect(generateRsaKeypairComponent.open).toHaveBeenCalled();
    });

    it('should open keys folder', () => {
      component.openKeysFolder();
      expect(component.electron.send).toHaveBeenCalledWith('open-keys-folder', null);
    });
  });

  describe('Help dialog', () => {
    it('should show help dialog', () => {
      component.showHelp();
      expect(component.isHelpModalVisible).toBeTrue();
    });
  });

  describe('Zoom operations', () => {
    it('should handle zoom in', fakeAsync(() => {
      component.zoomIn();
      tick();

      expect(component.electron.zoomIn).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith('zoom', '1.1');
    }));

    it('should handle zoom out', fakeAsync(() => {
      component.zoomOut();
      tick();

      expect(component.electron.zoomOut).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith('zoom', '0.9');
    }));
  });

  describe('UI elements', () => {
    it('should show keys folder button when folder exists', () => {
      const keysFolderButton = fixture.nativeElement.querySelector('p-button[icon="pi pi-folder"]');
      expect(keysFolderButton).toBeTruthy();
    });

    it('should render language selector with options', () => {
      const select = fixture.nativeElement.querySelector('p-select');
      expect(select).toBeTruthy();
      expect(component.languages).toEqual([
        { language: 'UA' },
        { language: 'EN' }
      ]);
    });

    it('should render theme toggle', () => {
      const themeToggle = fixture.nativeElement.querySelector('p-toggleswitch');
      expect(themeToggle).toBeTruthy();
      expect(component.isDarkTheme).toBeTrue();
    });

    it('should render zoom controls', () => {
      const zoomButtons = fixture.nativeElement.querySelectorAll('p-button[variant="text"]');
      expect(zoomButtons.length).toBe(4);
    });
  });
});
