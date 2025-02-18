import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DecryptDialogComponent} from './decrypt-dialog.component';
import {DialogService} from '../../../services/dialog.service';
import {MessageService} from 'primeng/api';
import {FileEncryptionService} from '../../../services/file-encryption.service';
import {TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {LoadingService} from '../../../services/loading.service';
import {BehaviorSubject, of} from 'rxjs';
import {ProcessingResult} from '../../../interfaces/processing-result';
import {Dialog} from 'primeng/dialog';
import {FloatLabel} from 'primeng/floatlabel';
import {FormsModule} from '@angular/forms';
import {Button} from 'primeng/button';
import {Password} from 'primeng/password';
import {Checkbox} from 'primeng/checkbox';
import {InputText} from 'primeng/inputtext';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('DecryptDialogComponent', () => {
  let component: DecryptDialogComponent;
  let fixture: ComponentFixture<DecryptDialogComponent>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let fileEncryptionService: jasmine.SpyObj<FileEncryptionService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let loadingService: jasmine.SpyObj<LoadingService>;
  let electronSpy: jasmine.SpyObj<any>;

  const mockTranslations: Record<string, string> = {
    'TOASTS.SUCCESS_TITLE': 'Success',
    'TOASTS.WARNING_TITLE': 'Warning',
    'TOASTS.ERROR_TITLE': 'Error',
    'TOASTS.DECRYPT.SUCCESS_MESSAGE': 'Decryption successful',
    'TOASTS.DECRYPT.ERROR_MESSAGE': 'Decryption failed',
    'TOASTS.DECRYPT.STARTED_MESSAGE': 'Decryption started',
    'TOASTS.DECRYPT.FILES_DONE_MESSAGE': 'Files processed',
    'TOASTS.DECRYPT.FILES_FAILED_MESSAGE': 'Files failed',
    'TOASTS.DECRYPT.FAILED_FILES_MESSAGE': 'Failed files'
  };

  const mockFile = {
    name: 'test.txt',
    path: 'path',
    encrypted: true,
    size: 100,
    formattedSize: '100 B'
  };

  beforeEach(async () => {
    electronSpy = jasmine.createSpyObj('electron', ['selectKeyDialog']);
    (window as any).electron = electronSpy;

    dialogService = jasmine.createSpyObj('DialogService', ['hideDecryptDialog'], {
      decryptDialogVisible$: new BehaviorSubject<boolean>(false)
    });

    messageService = jasmine.createSpyObj('MessageService', ['add']);

    fileEncryptionService = jasmine.createSpyObj('FileEncryptionService', ['decryptFiles'], {
      pendingCryptingFiles: []
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

    loadingService = jasmine.createSpyObj('LoadingService', ['show', 'hide'], {
      loading$: new BehaviorSubject<boolean>(false)
    });

    await TestBed.configureTestingModule({
      imports: [
        DecryptDialogComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        }),
        NoopAnimationsModule,
        Dialog,
        FloatLabel,
        FormsModule,
        Button,
        Password,
        Checkbox,
        InputText
      ],
      providers: [
        { provide: DialogService, useValue: dialogService },
        { provide: MessageService, useValue: messageService },
        { provide: FileEncryptionService, useValue: fileEncryptionService },
        { provide: TranslateService, useValue: translateService },
        { provide: LoadingService, useValue: loadingService }
      ]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en');
    translate.use('en');

    fixture = TestBed.createComponent(DecryptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Dialog initialization', () => {
    it('should initialize with default values', () => {
      expect(component.keyPath).toBe('');
      expect(component.password).toBe('');
      expect(component.deleteAfter).toBeTrue();
      expect(component.dialogVisible).toBeFalse();
      expect(component.loading).toBeFalse();
    });

    it('should subscribe to dialog visibility changes', () => {
      (dialogService.decryptDialogVisible$ as BehaviorSubject<boolean>).next(true);
      fixture.detectChanges();
      expect(component.dialogVisible).toBeTrue();
    });

    it('should subscribe to loading changes', () => {
      (loadingService.loading$ as BehaviorSubject<boolean>).next(true);
      fixture.detectChanges();
      expect(component.loading).toBeTrue();
    });
  });

  describe('Key selection', () => {
    it('should handle private key selection', async () => {
      const testKey = '/path/to/private.key';
      electronSpy.selectKeyDialog.and.returnValue(Promise.resolve(testKey));

      await component.openKeysFolder(false);
      fixture.detectChanges();

      expect(electronSpy.selectKeyDialog).toHaveBeenCalledWith(false);
      expect(component.keyPath).toBe(testKey);
    });

    it('should not update keyPath for public key selection', async () => {
      const testKey = '/path/to/public.key';
      electronSpy.selectKeyDialog.and.returnValue(Promise.resolve(testKey));

      await component.openKeysFolder(true);
      fixture.detectChanges();

      expect(electronSpy.selectKeyDialog).toHaveBeenCalledWith(true);
      expect(component.keyPath).toBe('');
    });

    it('should handle key selection cancellation', async () => {
      component.keyPath = 'original/path';
      electronSpy.selectKeyDialog.and.returnValue(Promise.resolve(null));

      await component.openKeysFolder(false);
      fixture.detectChanges();

      expect(component.keyPath).toBeNull();
    });
  });

  describe('Decryption process', () => {
    const setupDecryption = () => {
      component.password = 'testPassword';
      component.keyPath = '/path/to/key';
      component.deleteAfter = true;
    };

    beforeEach(() => {
      setupDecryption();
    });

    it('should start decryption process with correct parameters', () => {
      fileEncryptionService.decryptFiles.and.returnValue(Promise.resolve({
        okCount: 1,
        failCount: 0,
        failedFiles: []
      }));

      component.decrypt();

      expect(fileEncryptionService.decryptFiles).toHaveBeenCalledWith('testPassword', '/path/to/key', true);
    });

    it('should show and hide loading indicator during decryption', async () => {
      fileEncryptionService.decryptFiles.and.returnValue(Promise.resolve({
        okCount: 1,
        failCount: 0,
        failedFiles: []
      }));

      await component.decrypt();

      expect(loadingService.show).toHaveBeenCalled();
      expect(loadingService.hide).toHaveBeenCalled();
    });

    it('should handle mixed success/failure results', async () => {
      const result: ProcessingResult = {
        okCount: 2,
        failCount: 1,
        failedFiles: [{
          name: 'failed.txt',
          path: 'path',
          encrypted: true,
          size: 100,
          formattedSize: '100 B'
        }]
      };
      fileEncryptionService.decryptFiles.and.returnValue(Promise.resolve(result));

      await component.decrypt();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: mockTranslations['TOASTS.WARNING_TITLE'],
        detail: jasmine.any(String)
      });
    });
  });

  describe('File management', () => {
    it('should clear pending files list', () => {
      fileEncryptionService.pendingCryptingFiles = [
        {
          name: 'test1.txt',
          path: 'path1',
          encrypted: true,
          size: 100,
          formattedSize: '100 B'
        },
        {
          name: 'test2.txt',
          path: 'path2',
          encrypted: false,
          size: 200,
          formattedSize: '200 B'
        }
      ];

      component.clearFilesToProcess();

      expect(fileEncryptionService.pendingCryptingFiles).toEqual([]);
    });

    it('should handle empty pending files list', () => {
      fileEncryptionService.pendingCryptingFiles = [];

      component.clearFilesToProcess();

      expect(fileEncryptionService.pendingCryptingFiles).toEqual([]);
    });
  });

  describe('Translation handling', () => {
    it('should translate success messages correctly', async () => {
      fileEncryptionService.decryptFiles.and.returnValue(Promise.resolve({
        okCount: 1,
        failCount: 0,
        failedFiles: []
      }));

      await component.decrypt();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: mockTranslations['TOASTS.SUCCESS_TITLE'],
        detail: mockTranslations['TOASTS.DECRYPT.SUCCESS_MESSAGE']
      });
    });

    it('should translate error messages correctly', async () => {
      fileEncryptionService.decryptFiles.and.returnValue(Promise.resolve({
        okCount: 0,
        failCount: 1,
        failedFiles: [{
          name: 'test.txt',
          path: 'path',
          encrypted: true,
          size: 100,
          formattedSize: '100 B'
        }]
      }));

      await component.decrypt();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: mockTranslations['TOASTS.ERROR_TITLE'],
        detail: mockTranslations['TOASTS.DECRYPT.ERROR_MESSAGE']
      });
    });
  });
});
