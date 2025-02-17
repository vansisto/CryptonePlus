import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilesTableComponent } from './files-table.component';
import { FilesService } from '../../services/files.service';
import { FileEncryptionService } from '../../services/file-encryption.service';
import { DialogService } from '../../services/dialog.service';
import { SendFilesService } from '../../services/send-files.service';
import { WhatsAppService } from '../../services/whats-app.service';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('FilesTableComponent', () => {
  let component: FilesTableComponent;
  let fixture: ComponentFixture<FilesTableComponent>;
  let mockFilesService: jasmine.SpyObj<FilesService>;
  let mockFileEncryptionService: jasmine.SpyObj<FileEncryptionService>;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockSendFilesService: jasmine.SpyObj<SendFilesService>;
  let mockWhatsAppService: jasmine.SpyObj<WhatsAppService>;

  beforeEach(async () => {
    mockFilesService = jasmine.createSpyObj('FilesService', ['removeFileFromAll'], {
      allFiles$: new BehaviorSubject([]),
      selectedFiles$: new BehaviorSubject([])
    });
    mockFileEncryptionService = jasmine.createSpyObj('FileEncryptionService', ['addFileToPending']);
    mockDialogService = jasmine.createSpyObj('DialogService', ['showEncryptDialog', 'showDecryptDialog']);
    mockSendFilesService = jasmine.createSpyObj('SendFilesService', [], {
      filesToSend: []
    });
    mockWhatsAppService = jasmine.createSpyObj('WhatsAppService', ['sendViaWhatsApp'], {
      isWhatsAppLoading$: new BehaviorSubject(false)
    });

    (window as any).electron = {
      send: jasmine.createSpy('send'),
      receive: jasmine.createSpy('receive'),
      showFileInFolder: jasmine.createSpy('showFileInFolder')
    };

    await TestBed.configureTestingModule({
      imports: [
        FilesTableComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: FilesService, useValue: mockFilesService },
        { provide: FileEncryptionService, useValue: mockFileEncryptionService },
        { provide: DialogService, useValue: mockDialogService },
        { provide: SendFilesService, useValue: mockSendFilesService },
        { provide: WhatsAppService, useValue: mockWhatsAppService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FilesTableComponent);
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
