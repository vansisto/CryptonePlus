import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlComponent } from './control.component';
import { FilesService } from '../../services/files.service';
import { DialogService } from '../../services/dialog.service';
import { FileEncryptionService } from '../../services/file-encryption.service';
import { WhatsAppService } from '../../services/whats-app.service';
import { BehaviorSubject } from 'rxjs';
import { CFile } from '../../models/cfile';
import { Button } from 'primeng/button';
import {TranslateModule} from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { Popover } from 'primeng/popover';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Divider } from 'primeng/divider';

describe('ControlComponent', () => {
  let component: ControlComponent;
  let fixture: ComponentFixture<ControlComponent>;
  let filesService: jasmine.SpyObj<FilesService>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let fileEncryptionService: jasmine.SpyObj<FileEncryptionService>;
  let whatsAppService: jasmine.SpyObj<WhatsAppService>;
  let electronSpy: jasmine.SpyObj<any>;

  const mockFiles: CFile[] = [
    { path: 'test1.txt', name: 'test1.txt', encrypted: false, formattedSize: "100 B", size: 100 },
    { path: 'test2.txt', name: 'test2.txt', encrypted: true, formattedSize: "200 B", size: 200 }
  ];

  beforeEach(async () => {
    electronSpy = jasmine.createSpyObj('electron', ['openFileDialog']);
    (window as any).electron = electronSpy;

    const filesServiceSpy = jasmine.createSpyObj('FilesService', [
      'removeAllFiles',
      'removeSelected',
      'getTotalSize'
    ], {
      selectedFiles$: new BehaviorSubject<CFile[]>([]),
      allFiles$: new BehaviorSubject<CFile[]>([])
    });

    const dialogServiceSpy = jasmine.createSpyObj('DialogService', [
      'showEncryptDialog',
      'showDecryptDialog'
    ]);

    const fileEncryptionServiceSpy = jasmine.createSpyObj('FileEncryptionService', [
      'addFilesToPending'
    ]);

    const whatsAppServiceSpy = jasmine.createSpyObj('WhatsAppService', ['sendViaWhatsApp'], {
      isWhatsAppLoading$: new BehaviorSubject<boolean>(false)
    });

    await TestBed.configureTestingModule({
      imports: [
        ControlComponent,
        TranslateModule.forRoot(),
        Button,
        TableModule,
        NgIf,
        NgOptimizedImage,
        Popover,
        ProgressSpinner,
        Divider
      ],
      providers: [
        { provide: FilesService, useValue: filesServiceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        { provide: FileEncryptionService, useValue: fileEncryptionServiceSpy },
        { provide: WhatsAppService, useValue: whatsAppServiceSpy }
      ]
    }).compileComponents();

    filesService = TestBed.inject(FilesService) as jasmine.SpyObj<FilesService>;
    dialogService = TestBed.inject(DialogService) as jasmine.SpyObj<DialogService>;
    fileEncryptionService = TestBed.inject(FileEncryptionService) as jasmine.SpyObj<FileEncryptionService>;
    whatsAppService = TestBed.inject(WhatsAppService) as jasmine.SpyObj<WhatsAppService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;

    (window as any).electron = {
      openFileDialog: jasmine.createSpy('openFileDialog')
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update selected files when FilesService emits', () => {
    (filesService.selectedFiles$ as BehaviorSubject<CFile[]>).next(mockFiles);
    expect(component.selectedFiles).toEqual(mockFiles);
  });

  it('should update all files when FilesService emits', () => {
    (filesService.allFiles$ as BehaviorSubject<CFile[]>).next(mockFiles);
    expect(component.allFiles).toEqual(mockFiles);
  });

  it('should update WhatsApp loading state when service emits', () => {
    (whatsAppService.isWhatsAppLoading$ as BehaviorSubject<boolean>).next(true);
    expect(component.isWhatsAppLoading).toBeTrue();
  });

  it('should call electron.openFileDialog when addFiles is called', () => {
    component.addFiles();
    expect(electronSpy.openFileDialog).toHaveBeenCalled();
  });

  it('should format total size correctly', () => {
    filesService.getTotalSize.and.returnValue(1024);
    expect(component.totalSizeFormatted).toBe('1.00 KB');
  });

  it('should call filesService.removeAllFiles when removeAll is called', () => {
    component.removeAll();
    expect(filesService.removeAllFiles).toHaveBeenCalled();
  });

  it('should call filesService.removeSelected when removeSelected is called', () => {
    component.removeSelected();
    expect(filesService.removeSelected).toHaveBeenCalled();
  });

  describe('showEncryptDialog', () => {
    beforeEach(() => {
      component.allFiles = [...mockFiles];
      component.selectedFiles = [mockFiles[0]];
    });

    it('should add all files to pending when type is ALL', () => {
      component.showEncryptDialog('ALL');
      expect(fileEncryptionService.addFilesToPending).toHaveBeenCalledWith(mockFiles);
      expect(dialogService.showEncryptDialog).toHaveBeenCalled();
    });

    it('should add selected files to pending when type is SELECTED', () => {
      component.showEncryptDialog('SELECTED');
      expect(fileEncryptionService.addFilesToPending).toHaveBeenCalledWith([mockFiles[0]]);
      expect(dialogService.showEncryptDialog).toHaveBeenCalled();
    });
  });

  describe('showDecryptDialog', () => {
    beforeEach(() => {
      component.allFiles = [...mockFiles];
      component.selectedFiles = [mockFiles[0]];
    });

    it('should add all files to pending when type is ALL', () => {
      component.showDecryptDialog('ALL');
      expect(fileEncryptionService.addFilesToPending).toHaveBeenCalledWith(mockFiles);
      expect(dialogService.showDecryptDialog).toHaveBeenCalled();
    });

    it('should add selected files to pending when type is SELECTED', () => {
      component.showDecryptDialog('SELECTED');
      expect(fileEncryptionService.addFilesToPending).toHaveBeenCalledWith([mockFiles[0]]);
      expect(dialogService.showDecryptDialog).toHaveBeenCalled();
    });
  });

  describe('containEncrypted', () => {
    it('should return true when any file is encrypted', () => {
      component.allFiles = [...mockFiles]; // includes one encrypted file
      expect(component.containEncrypted()).toBeTrue();
    });

    it('should return false when no files are encrypted', () => {
      component.allFiles = [mockFiles[0]]; // only unencrypted file
      expect(component.containEncrypted()).toBeFalse();
    });
  });

  describe('selectedContainEncrypted', () => {
    it('should return true when any selected file is encrypted', () => {
      component.selectedFiles = [mockFiles[1]]; // encrypted file
      expect(component.selectedContainEncrypted()).toBeTrue();
    });

    it('should return false when no selected files are encrypted', () => {
      component.selectedFiles = [mockFiles[0]]; // unencrypted file
      expect(component.selectedContainEncrypted()).toBeFalse();
    });
  });

  describe('WhatsApp integration', () => {
    it('should send selected files via WhatsApp', () => {
      component.selectedFiles = [mockFiles[0]];
      component.sendSelectedFiles();
      expect(whatsAppService.sendViaWhatsApp).toHaveBeenCalledWith([mockFiles[0]]);
    });

    it('should send all files via WhatsApp', () => {
      component.allFiles = mockFiles;
      component.sendAllFiles();
      expect(whatsAppService.sendViaWhatsApp).toHaveBeenCalledWith(mockFiles);
    });
  });
});
