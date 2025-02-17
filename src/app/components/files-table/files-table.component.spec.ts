import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FilesTableComponent } from './files-table.component';
import { FilesService } from '../../services/files.service';
import { FileEncryptionService } from '../../services/file-encryption.service';
import { DialogService } from '../../services/dialog.service';
import { WhatsAppService } from '../../services/whats-app.service';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { BehaviorSubject } from 'rxjs';
import { CFile } from '../../models/cfile';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { InputFile } from '../../interfaces/input-file';

describe('FilesTableComponent', () => {
  let component: FilesTableComponent;
  let fixture: ComponentFixture<FilesTableComponent>;
  let filesService: jasmine.SpyObj<FilesService>;
  let fileEncryptionService: jasmine.SpyObj<FileEncryptionService>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let whatsAppService: jasmine.SpyObj<WhatsAppService>;

  const mockFiles: CFile[] = [
    {
      path: '/path/to/file1.txt',
      name: 'file1.txt',
      size: 1024,
      formattedSize: '1 KB',
      encrypted: false,
      type: 'text/plain'
    } as CFile,
    {
      path: '/path/to/file2.enc',
      name: 'file2.enc',
      size: 2048,
      formattedSize: '2 KB',
      encrypted: true,
      type: 'application/octet-stream'
    } as CFile
  ];

  beforeEach(async () => {
    filesService = jasmine.createSpyObj('FilesService',
      ['removeFileFromAll', 'addFileToAll', 'updateSelectedFiles'],
      {
        allFiles$: new BehaviorSubject<CFile[]>(mockFiles),
        selectedFiles$: new BehaviorSubject<CFile[]>([])
      }
    );

    fileEncryptionService = jasmine.createSpyObj('FileEncryptionService',
      ['addFileToPending']
    );

    dialogService = jasmine.createSpyObj('DialogService',
      ['showEncryptDialog', 'showDecryptDialog']
    );

    whatsAppService = jasmine.createSpyObj('WhatsAppService',
      ['sendViaWhatsApp'],
      {
        isWhatsAppLoading$: new BehaviorSubject<boolean>(false)
      }
    );

    (window as any).electron = {
      send: jasmine.createSpy('send'),
      receive: jasmine.createSpy('receive'),
      showFileInFolder: jasmine.createSpy('showFileInFolder')
    };

    await TestBed.configureTestingModule({
      imports: [
        FilesTableComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        }),
        NoopAnimationsModule,
        TableModule,
        ButtonModule,
        TooltipModule,
        PopoverModule
      ],
      providers: [
        { provide: FilesService, useValue: filesService },
        { provide: FileEncryptionService, useValue: fileEncryptionService },
        { provide: DialogService, useValue: dialogService },
        { provide: WhatsAppService, useValue: whatsAppService }
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

  it('should initialize with correct data', () => {
    expect(component.allFiles).toEqual(mockFiles);
    expect(component.selectedFiles).toEqual([]);
    expect(component.isWhatsAppLoading).toBeFalse();
  });

  it('should setup electron handlers on init', () => {
    expect(component.electron.send).toHaveBeenCalledWith('get-pending-files');
    expect(component.electron.receive).toHaveBeenCalledWith('add-files', jasmine.any(Function));
  });

  describe('file operations', () => {
    it('should remove file', () => {
      component.removeFile(mockFiles[0]);
      expect(filesService.removeFileFromAll).toHaveBeenCalledWith(mockFiles[0]);
    });

    it('should show encrypt dialog', () => {
      component.showEncryptDialog(mockFiles[0]);
      expect(fileEncryptionService.addFileToPending).toHaveBeenCalledWith(mockFiles[0]);
      expect(dialogService.showEncryptDialog).toHaveBeenCalled();
    });

    it('should show decrypt dialog', () => {
      component.showDecryptDialog(mockFiles[1]);
      expect(fileEncryptionService.addFileToPending).toHaveBeenCalledWith(mockFiles[1]);
      expect(dialogService.showDecryptDialog).toHaveBeenCalled();
    });

    it('should send via WhatsApp', () => {
      component.sendViaWhatsApp(mockFiles[0]);
      expect(whatsAppService.sendViaWhatsApp).toHaveBeenCalledWith([mockFiles[0]]);
    });

    it('should open folder with selected file', () => {
      component.openFolderWithSelectedFile(mockFiles[0]);
      expect(component.electron.showFileInFolder).toHaveBeenCalledWith(mockFiles[0]);
    });
  });

  describe('file handling', () => {
    it('should add new files', fakeAsync(() => {
      const inputFiles: InputFile[] = [{
        path: '/path/to/new.txt',
        name: 'new.txt',
        size: 512,
        encrypted: false
      }];

      const receiveCall = (component.electron.receive as jasmine.Spy).calls.allArgs()
        .find(call => call[0] === 'add-files');
      expect(receiveCall).toBeDefined();

      if (receiveCall) {
        const addFilesCallback = receiveCall[1];
        addFilesCallback(inputFiles);
        tick();

        expect(filesService.addFileToAll).toHaveBeenCalled();
      }
    }));

    it('should not add duplicate files', fakeAsync(() => {
      const existingFile: InputFile = {
        path: mockFiles[0].path,
        name: mockFiles[0].name,
        size: mockFiles[0].size,
        encrypted: mockFiles[0].encrypted
      };

      const receiveCall = (component.electron.receive as jasmine.Spy).calls.allArgs()
        .find(call => call[0] === 'add-files');

      if (receiveCall) {
        const addFilesCallback = receiveCall[1];
        addFilesCallback([existingFile]);
        tick();

        expect(filesService.addFileToAll).not.toHaveBeenCalled();
      }
    }));
  });

  describe('UI elements', () => {
    it('should render table with correct columns', () => {
      const headers = fixture.nativeElement.querySelectorAll('th');
      expect(headers.length).toBe(9);
    });

    it('should show decrypt button only for encrypted files', () => {
      fixture.detectChanges();
      const rows = fixture.nativeElement.querySelectorAll('tr');

      const firstFileRow = rows[1];
      const secondFileRow = rows[2];

      const firstFileDecryptButton = firstFileRow.querySelector('p-button[icon="pi pi-lock-open"]');
      const secondFileDecryptButton = secondFileRow.querySelector('p-button[icon="pi pi-lock-open"]');

      expect(firstFileDecryptButton).toBeNull();
      expect(secondFileDecryptButton).toBeTruthy();
    });
  });

  describe('path handling', () => {
    it('should correctly get file path directory for Windows paths', () => {
      const windowsPath = 'C:\\Users\\test\\file.txt';
      expect(component.getFilePathDirectory(windowsPath)).toBe('C:\\Users\\test');
    });

    it('should correctly get file path directory for Unix paths', () => {
      const unixPath = '/home/user/file.txt';
      expect(component.getFilePathDirectory(unixPath)).toBe('/home/user');
    });

    it('should return original path if no directory separator found', () => {
      const noSeparatorPath = 'file.txt';
      expect(component.getFilePathDirectory(noSeparatorPath)).toBe('file.txt');
    });
  });
});
