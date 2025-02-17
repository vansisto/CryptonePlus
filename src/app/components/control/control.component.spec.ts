import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlComponent } from './control.component';
import { BehaviorSubject } from 'rxjs';
import { FilesService } from '../../services/files.service';
import { DialogService } from '../../services/dialog.service';
import { FileEncryptionService } from '../../services/file-encryption.service';
import { WhatsAppService } from '../../services/whats-app.service';
import { TranslateModule } from '@ngx-translate/core';

describe('ControlComponent', () => {
  let component: ControlComponent;
  let fixture: ComponentFixture<ControlComponent>;
  let mockFilesService: jasmine.SpyObj<FilesService>;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockFileEncryptionService: jasmine.SpyObj<FileEncryptionService>;
  let mockWhatsAppService: jasmine.SpyObj<WhatsAppService>;

  beforeEach(async () => {
    mockFilesService = jasmine.createSpyObj('FilesService', ['getTotalSize', 'removeAllFiles', 'removeSelected'], {
      allFiles$: new BehaviorSubject([]),
      selectedFiles$: new BehaviorSubject([])
    });

    mockDialogService = jasmine.createSpyObj('DialogService', ['showEncryptDialog', 'showDecryptDialog']);
    mockFileEncryptionService = jasmine.createSpyObj('FileEncryptionService', ['addFilesToPending']);
    mockWhatsAppService = jasmine.createSpyObj('WhatsAppService', ['sendViaWhatsApp'], {
      isWhatsAppLoading$: new BehaviorSubject(false)
    });

    (window as any).electron = {
      send: jasmine.createSpy('send'),
      receive: jasmine.createSpy('receive'),
      openFileDialog: jasmine.createSpy('openFileDialog')
    };

    await TestBed.configureTestingModule({
      imports: [
        ControlComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: FilesService, useValue: mockFilesService },
        { provide: DialogService, useValue: mockDialogService },
        { provide: FileEncryptionService, useValue: mockFileEncryptionService },
        { provide: WhatsAppService, useValue: mockWhatsAppService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ControlComponent);
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
