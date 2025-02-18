import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GenerateRsaKeypairComponent } from './generate-rsa-keypair.component';
import { MessageService } from 'primeng/api';
import { KeyPairsService } from '../../../services/key-pairs.service';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Dialog } from 'primeng/dialog';
import { Checkbox } from 'primeng/checkbox';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Observable, of } from 'rxjs';

class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({
      'TOASTS.SUCCESS_TITLE': 'Success',
      'TOASTS.GENERATE_KEY_PAIR.SUCCESS': 'Keys generated successfully',
      'TOASTS.GENERATE_KEY_PAIR.IN_PROGRESS_TITLE': 'Generating',
      'TOASTS.GENERATE_KEY_PAIR.IN_PROGRESS_MESSAGE': 'Generating key pair...'
    });
  }
}

describe('GenerateRsaKeypairComponent', () => {
  let component: GenerateRsaKeypairComponent;
  let fixture: ComponentFixture<GenerateRsaKeypairComponent>;
  let mockKeyPairsService: jasmine.SpyObj<KeyPairsService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let translateService: TranslateService;

  beforeEach(async () => {
    mockKeyPairsService = jasmine.createSpyObj('KeyPairsService', ['checkKeysFolderExisting']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    (window as any).electron = {
      send: jasmine.createSpy('send'),
      generateKeysWithDifferentNames: jasmine.createSpy('generateKeysWithDifferentNames')
        .and.returnValue(Promise.resolve('test-folder')),
      generateKeyPair: jasmine.createSpy('generateKeyPair')
        .and.returnValue(Promise.resolve())
    };

    await TestBed.configureTestingModule({
      imports: [
        GenerateRsaKeypairComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        Dialog,
        Checkbox,
        FloatLabel,
        InputText,
        Button,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: MockTranslateLoader
          }
        })
      ],
      providers: [
        { provide: KeyPairsService, useValue: mockKeyPairsService },
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GenerateRsaKeypairComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en');
    translateService.use('en');
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as any).electron;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.visible).toBeFalse();
    expect(component.useCustomName).toBeFalse();
    expect(component.isDifferentKeysNames).toBeFalse();
    expect(component.customName).toBe('');
    expect(component.publicKeyName).toBe('');
    expect(component.privateKeyName).toBe('');
    expect(component.formGroup).toBeTruthy();
  });

  it('should open dialog', () => {
    component.open();
    expect(component.visible).toBeTrue();
  });

  describe('key pair generation', () => {
    beforeEach(() => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date('2025-02-18T09:22:57Z'));
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should generate key pair with custom name', fakeAsync(() => {
      component.useCustomName = true;
      component.customName = 'test-keypair';

      component.onGenerateClick();
      tick();

      expect(component.electron.send).toHaveBeenCalledWith('create-rsa-keypair-folder', 'test-keypair');
      expect(component.electron.generateKeyPair).toHaveBeenCalledWith('test-keypair');
    }));

    it('should generate key pair with different names', fakeAsync(() => {
      component.useCustomName = true;
      component.isDifferentKeysNames = true;
      component.publicKeyName = 'public-key';
      component.privateKeyName = 'private-key';

      component.onGenerateClick();
      tick();

      expect(component.electron.generateKeysWithDifferentNames)
        .toHaveBeenCalledWith('public-key', 'private-key');
    }));

    it('should show progress and success messages', fakeAsync(() => {
      component.useCustomName = true;
      component.customName = 'test-keypair';

      component.onGenerateClick();
      tick();

      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'info',
          summary: 'Generating'
        })
      );

      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'success',
          summary: 'Success'
        })
      );
    }));
  });
});
