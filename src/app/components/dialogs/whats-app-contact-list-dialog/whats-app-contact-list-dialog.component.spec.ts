import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhatsAppContactListDialogComponent } from './whats-app-contact-list-dialog.component';
import { DialogService } from '../../../services/dialog.service';
import { WhatsAppService } from '../../../services/whats-app.service';
import { SendFilesService } from '../../../services/send-files.service';
import { MessageService } from 'primeng/api';
import { TranslateService, TranslateModule, TranslateFakeLoader, TranslateLoader } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { CContact } from '../../../models/ccontact';

describe('WhatsAppContactListDialogComponent', () => {
  let component: WhatsAppContactListDialogComponent;
  let fixture: ComponentFixture<WhatsAppContactListDialogComponent>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let whatsAppService: jasmine.SpyObj<WhatsAppService>;
  let sendFilesService: jasmine.SpyObj<SendFilesService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let translateService: jasmine.SpyObj<TranslateService>;

  const mockTranslations: Record<string, string> = {
    'TOASTS.ERROR_TITLE': 'Error',
    'TOASTS.WHATSAPP.FILE_TOO_LARGE': 'File is too large',
    'SEND': 'Send'
  };

  const mockContacts: CContact[] = [
    (() => {
      const contact = new CContact();
      contact.id._serialized = '1234567890';
      contact.name = 'John Doe';
      contact.pushname = 'John';
      contact.profilePicUrl = 'https://example.com/pic1.jpg';
      contact.isUser = true;
      return contact;
    })(),
    (() => {
      const contact = new CContact();
      contact.id._serialized = '0987654321';
      contact.name = 'Jane Smith';
      contact.pushname = 'Jane';
      contact.profilePicUrl = 'https://example.com/pic2.jpg';
      contact.isUser = true;
      return contact;
    })()
  ];

  beforeEach(async () => {
    (window as any).electron = {
      send: jasmine.createSpy('send'),
      receive: jasmine.createSpy('receive')
    };

    dialogService = jasmine.createSpyObj('DialogService',
      ['hideWhatsAppContactListDialog', 'showWhatsAppFileTooLargeDialog'],
      {
        whatsAppContactListDialogVisible$: new BehaviorSubject<boolean>(false)
      }
    );

    whatsAppService = jasmine.createSpyObj('WhatsAppService',
      [],
      {
        ccontacts$: new BehaviorSubject<CContact[]>(mockContacts),
        isWhatsAppLoadingSubject: new BehaviorSubject<boolean>(false)
      }
    );

    sendFilesService = jasmine.createSpyObj('SendFilesService',
      ['sendFiles'],
      {
        filesToSend: []
      }
    );

    messageService = jasmine.createSpyObj('MessageService', ['add']);

    translateService = jasmine.createSpyObj('TranslateService', ['instant', 'get', 'setDefaultLang', 'use'], {
      currentLang: 'en',
      onLangChange: new BehaviorSubject(null),
      onTranslationChange: new BehaviorSubject(null),
      onDefaultLangChange: new BehaviorSubject(null)
    });
    translateService.instant.and.callFake((key: string) => mockTranslations[key] || key);
    translateService.get.and.callFake((key: string) => of(mockTranslations[key] || key));

    await TestBed.configureTestingModule({
      imports: [
        WhatsAppContactListDialogComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        }),
        NoopAnimationsModule,
        DialogModule,
        ListboxModule,
        ButtonModule,
        FormsModule
      ],
      providers: [
        { provide: DialogService, useValue: dialogService },
        { provide: WhatsAppService, useValue: whatsAppService },
        { provide: SendFilesService, useValue: sendFilesService },
        { provide: MessageService, useValue: messageService },
        { provide: TranslateService, useValue: translateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WhatsAppContactListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.whatsAppContactListDialogVisible).toBeFalse();
    expect(component.cContacts).toEqual(mockContacts);
    expect(component.cContact).toBeNull();
  });

  it('should subscribe to dialog visibility changes', () => {
    (dialogService.whatsAppContactListDialogVisible$ as BehaviorSubject<boolean>).next(true);
    fixture.detectChanges();
    expect(component.whatsAppContactListDialogVisible).toBeTrue();
  });

  it('should subscribe to contacts changes', () => {
    const newContacts = [mockContacts[0]];
    (whatsAppService.ccontacts$ as BehaviorSubject<CContact[]>).next(newContacts);
    fixture.detectChanges();
    expect(component.cContacts).toEqual(newContacts);
  });

  describe('send()', () => {
    beforeEach(() => {
      component.cContact = mockContacts[0];
    });

    it('should handle successful file send', async () => {
      sendFilesService.sendFiles.and.returnValue(Promise.resolve({ status: 'ok', reason: '' }));

      await component.send();

      expect(dialogService.hideWhatsAppContactListDialog).toHaveBeenCalled();
      expect(whatsAppService.isWhatsAppLoadingSubject.value).toBeFalse();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'File sent successfully'
      });
      expect(sendFilesService.filesToSend).toEqual([]);
      expect(component.cContact).toBeNull();
    });

    it('should handle file too large error', async () => {
      sendFilesService.sendFiles.and.returnValue(Promise.resolve({
        status: 'error',
        reason: 'ERR_FS_FILE_TOO_LARGE'
      }));

      await component.send();

      expect(dialogService.hideWhatsAppContactListDialog).toHaveBeenCalled();
      expect(whatsAppService.isWhatsAppLoadingSubject.value).toBeFalse();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: mockTranslations['TOASTS.ERROR_TITLE'],
        detail: mockTranslations['TOASTS.WHATSAPP.FILE_TOO_LARGE']
      });
      expect(dialogService.showWhatsAppFileTooLargeDialog).toHaveBeenCalled();
      expect(sendFilesService.filesToSend).toEqual([]);
      expect(component.cContact).toBeNull();
    });
  });

  describe('UI elements', () => {
    it('should show send button only when contact is selected', () => {
      component.whatsAppContactListDialogVisible = true;
      fixture.detectChanges();

      let sendButton = fixture.nativeElement.querySelector('.p-dialog-footer p-button');
      expect(sendButton).toBeNull();

      component.cContact = mockContacts[0];
      fixture.detectChanges();

      sendButton = fixture.nativeElement.querySelector('.p-dialog-footer p-button');
      expect(sendButton).toBeTruthy();
    });

    it('should display contact name and profile picture in listbox', () => {
      component.whatsAppContactListDialogVisible = true;
      fixture.detectChanges();

      const contactElements = fixture.nativeElement.querySelectorAll('p-listbox .flex');
      expect(contactElements.length).toBe(mockContacts.length);

      const firstContact = contactElements[0];
      expect(firstContact.querySelector('img').src).toBe(mockContacts[0].profilePicUrl);
      expect(firstContact.querySelector('div').textContent).toContain(mockContacts[0].name);
    });
  });
});
