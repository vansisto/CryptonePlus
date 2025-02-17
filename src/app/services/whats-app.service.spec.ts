import { TestBed } from '@angular/core/testing';
import { WhatsAppService } from './whats-app.service';
import { SendFilesService } from './send-files.service';
import { DialogService } from './dialog.service';

describe('WhatsAppService', () => {
  let service: WhatsAppService;
  let mockSendFilesService: jasmine.SpyObj<SendFilesService>;
  let mockDialogService: jasmine.SpyObj<DialogService>;

  beforeEach(() => {
    (window as any).electron = {
      receive: jasmine.createSpy('receive'),
      getWhatsAppContactList: jasmine.createSpy('getWhatsAppContactList').and.returnValue(Promise.resolve([]))
    };

    mockSendFilesService = jasmine.createSpyObj('SendFilesService', [''], {
      filesToSend: []
    });

    mockDialogService = jasmine.createSpyObj('DialogService',
      ['showWhatsAppContactListDialog', 'isWhatsAppContactListDialogVisible']
    );

    TestBed.configureTestingModule({
      providers: [
        WhatsAppService,
        { provide: SendFilesService, useValue: mockSendFilesService },
        { provide: DialogService, useValue: mockDialogService }
      ]
    });

    service = TestBed.inject(WhatsAppService);
  });

  afterEach(() => {
    delete (window as any).electron;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
