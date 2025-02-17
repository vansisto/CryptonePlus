import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhatsAppFileTooLargeComponent } from './whats-app-file-too-large.component';
import { DialogService } from '../../../services/dialog.service';
import { TranslateService, TranslateModule, TranslateFakeLoader, TranslateLoader } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('WhatsAppFileTooLargeComponent', () => {
  let component: WhatsAppFileTooLargeComponent;
  let fixture: ComponentFixture<WhatsAppFileTooLargeComponent>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let translateService: jasmine.SpyObj<TranslateService>;

  const mockTranslations: Record<string, string> = {
    'DIALOGS.WHATSAPP.FILE_TOO_LARGE': 'File Too Large',
    'DIALOGS.WHATSAPP.FILE_TOO_LARGE_MESSAGE': 'The file is too large for WhatsApp'
  };

  beforeEach(async () => {
    dialogService = jasmine.createSpyObj('DialogService', [], {
      whatsAppFileTooLargeDialogVisible$: new BehaviorSubject<boolean>(false)
    });

    translateService = jasmine.createSpyObj('TranslateService',
      ['instant', 'get', 'setTranslation', 'use', 'setDefaultLang', 'getBrowserLang'],
      {
        onLangChange: new BehaviorSubject(null),
        onTranslationChange: new BehaviorSubject(null),
        onDefaultLangChange: new BehaviorSubject(null),
        currentLang: 'en'
      }
    );
    translateService.instant.and.callFake((key: string) => mockTranslations[key] || key);
    translateService.get.and.callFake((key: string) => of(mockTranslations[key] || key));

    await TestBed.configureTestingModule({
      imports: [
        WhatsAppFileTooLargeComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        }),
        NoopAnimationsModule,
        DialogModule
      ],
      providers: [
        { provide: DialogService, useValue: dialogService },
        { provide: TranslateService, useValue: translateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WhatsAppFileTooLargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with isVisible as false', () => {
    expect(component.isVisible).toBeFalse();
  });

  it('should subscribe to dialog visibility changes', () => {
    (dialogService.whatsAppFileTooLargeDialogVisible$ as BehaviorSubject<boolean>).next(true);
    fixture.detectChanges();
    expect(component.isVisible).toBeTrue();
  });

  it('should show dialog with correct translations', () => {
    component.isVisible = true;
    fixture.detectChanges();

    const dialogHeader = fixture.nativeElement.querySelector('p-dialog .p-dialog-header');
    const dialogContent = fixture.nativeElement.querySelector('p-dialog p');

    expect(dialogHeader.textContent).toContain(mockTranslations['DIALOGS.WHATSAPP.FILE_TOO_LARGE']);
    expect(dialogContent.textContent).toContain(mockTranslations['DIALOGS.WHATSAPP.FILE_TOO_LARGE_MESSAGE']);
  });
});
