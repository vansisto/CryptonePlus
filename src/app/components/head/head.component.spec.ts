import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeadComponent } from './head.component';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ThemeService } from '../../services/theme.service';
import { KeyPairsService } from '../../services/key-pairs.service';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from 'primeng/api';

describe('HeadComponent', () => {
  let component: HeadComponent;
  let fixture: ComponentFixture<HeadComponent>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let mockKeyPairsService: jasmine.SpyObj<KeyPairsService>;

  beforeEach(async () => {
    (window as any).electron = {
      send: jasmine.createSpy('send'),
      zoomIn: jasmine.createSpy('zoomIn').and.returnValue(Promise.resolve(1)),
      zoomOut: jasmine.createSpy('zoomOut').and.returnValue(Promise.resolve(1))
    };

    mockThemeService = jasmine.createSpyObj('ThemeService', ['toggleTheme'], {
      isDarkTheme: false
    });

    mockKeyPairsService = jasmine.createSpyObj('KeyPairsService', ['checkKeysFolderExisting'], {
      isKeysFolderExists$: new BehaviorSubject<boolean>(false)
    });

    await TestBed.configureTestingModule({
      imports: [
        HeadComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        { provide: KeyPairsService, useValue: mockKeyPairsService },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as any).electron;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
