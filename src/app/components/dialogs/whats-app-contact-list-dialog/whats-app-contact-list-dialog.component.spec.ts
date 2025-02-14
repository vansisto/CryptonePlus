import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhatsAppContactListDialogComponent } from './whats-app-contact-list-dialog.component';
import { DialogService } from '../../../services/dialog.service';
import { WhatsAppService } from '../../../services/whats-app.service';
import { SendFilesService } from '../../../services/send-files.service';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

describe('WhatsAppContactListDialogComponent', () => {
  let component: WhatsAppContactListDialogComponent;
  let fixture: ComponentFixture<WhatsAppContactListDialogComponent>;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockWhatsAppService: jasmine.SpyObj<WhatsAppService>;
  let mockSendFilesService: jasmine.SpyObj<SendFilesService>;

  beforeEach(async () => {
    (window as any).electron = {
      receive: jasmine.createSpy('receive'),
      getWhatsAppContactList: jasmine.createSpy('getWhatsAppContactList').and.returnValue(Promise.resolve([]))
    };

    mockDialogService = jasmine.createSpyObj('DialogService',
        ['hideWhatsAppContactListDialog', 'showWhatsAppFileTooLargeDialog', 'isWhatsAppContactListDialogVisible'],
        {
          whatsAppContactListDialogVisible$: new BehaviorSubject<boolean>(false)
        }
    );

    mockWhatsAppService = jasmine.createSpyObj('WhatsAppService', [], {
      ccontacts$: new BehaviorSubject<any[]>([]),
      isWhatsAppLoadingSubject: new BehaviorSubject<boolean>(false)
    });

    mockSendFilesService = jasmine.createSpyObj('SendFilesService', ['sendFiles'], {
      filesToSend: []
    });

    await TestBed.configureTestingModule({
      imports: [
        WhatsAppContactListDialogComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DialogService, useValue: mockDialogService },
        { provide: WhatsAppService, useValue: mockWhatsAppService },
        { provide: SendFilesService, useValue: mockSendFilesService },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WhatsAppContactListDialogComponent);
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
