import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import { FileEncryptionService } from './file-encryption.service';
import { FilesService } from './files.service';
import { ArchivatorService } from './archivator.service';
import { CFile } from '../models/cfile';

describe('FileEncryptionService', () => {
  let service: FileEncryptionService;
  let mockFilesService: jasmine.SpyObj<FilesService>;
  let mockArchivatorService: jasmine.SpyObj<ArchivatorService>;
  let mockElectron: any;

  const mockFiles: CFile[] = [
    new CFile('/path/test1.txt', 'test1.txt', false, 1000),
    new CFile('/path/test2.txt', 'test2.txt', false, 2000)
  ];

  const mockEncryptedFiles: CFile[] = [
    new CFile('/path/test1.enc', 'test1.enc', true, 1000),
    new CFile('/path/test2.enc', 'test2.enc', true, 2000)
  ];

  const mockArchive = new CFile('/path/archive.zip', 'archive.zip', false, 3000);

  beforeEach(() => {
    mockFilesService = jasmine.createSpyObj('FilesService', ['syncFilesWithFileSystem']);
    mockArchivatorService = jasmine.createSpyObj('ArchivatorService', ['archive', 'extract']);

    mockElectron = {
      encryptFile: jasmine.createSpy('encryptFile').and.returnValue(Promise.resolve({ success: true, message: 'OK' })),
      decryptFile: jasmine.createSpy('decryptFile').and.returnValue(Promise.resolve({ success: true, message: 'OK' })),
      deleteFiles: jasmine.createSpy('deleteFiles').and.returnValue(Promise.resolve())
    };

    (window as any).electron = mockElectron;

    TestBed.configureTestingModule({
      providers: [
        FileEncryptionService,
        { provide: FilesService, useValue: mockFilesService },
        { provide: ArchivatorService, useValue: mockArchivatorService }
      ]
    });

    service = TestBed.inject(FileEncryptionService);
  });

  afterEach(() => {
    delete (window as any).electron;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('File Management', () => {
    it('should add single file to pending', () => {
      const file = mockFiles[0];
      service.addFileToPending(file);
      expect(service.pendingCryptingFiles).toContain(file);
    });

    it('should not add duplicate file to pending', () => {
      const file = mockFiles[0];
      service.addFileToPending(file);
      service.addFileToPending(file);
      expect(service.pendingCryptingFiles.length).toBe(1);
    });

    it('should add multiple files to pending', () => {
      service.addFilesToPending(mockFiles);
      expect(service.pendingCryptingFiles.length).toBe(mockFiles.length);
    });

    it('should not add duplicate files when adding multiple', () => {
      service.addFilesToPending(mockFiles);
      service.addFilesToPending(mockFiles);
      expect(service.pendingCryptingFiles.length).toBe(mockFiles.length);
    });
  });

  describe('Encryption', () => {
    beforeEach(() => {
      service.pendingCryptingFiles = [...mockFiles];
    });

    it('should encrypt files without archiving', async () => {
      const result = await service.encryptFiles('password', 'keyPath', false, false);

      expect(result.okCount).toBe(2);
      expect(result.failCount).toBe(0);
      expect(mockElectron.encryptFile).toHaveBeenCalledTimes(2);
    });

    it('should encrypt files with archiving', async () => {
      mockArchivatorService.archive.and.returnValue(Promise.resolve(mockArchive));

      await service.encryptFiles('password', 'keyPath', false, true);

      expect(mockArchivatorService.archive).toHaveBeenCalledWith(mockFiles);
      expect(mockElectron.encryptFile).toHaveBeenCalledTimes(1);
    });

    it('should handle encryption failures', async () => {
      mockElectron.encryptFile.and.returnValue(Promise.resolve({ success: false, message: 'Error' }));

      const result = await service.encryptFiles('password', 'keyPath', false, false);

      expect(result.failCount).toBe(2);
      expect(result.okCount).toBe(0);
      expect(result.failedFiles).toEqual(mockFiles);
    });
  });

  describe('Decryption', () => {
    beforeEach(() => {
      service.pendingCryptingFiles = [...mockEncryptedFiles];
    });

    it('should decrypt files', async () => {
      const result = await service.decryptFiles('password', 'keyPath', false);

      expect(result.okCount).toBe(2);
      expect(result.failCount).toBe(0);
      expect(mockElectron.decryptFile).toHaveBeenCalledTimes(2);
      expect(mockArchivatorService.extract).toHaveBeenCalled();
    });

    it('should handle decryption failures', async () => {
      mockElectron.decryptFile.and.returnValue(Promise.resolve({ success: false, message: 'Error' }));

      const result = await service.decryptFiles('password', 'keyPath', false);

      expect(result.failCount).toBe(2);
      expect(result.okCount).toBe(0);
      expect(result.failedFiles).toEqual(mockEncryptedFiles);
    });
  });

  describe('File Deletion', () => {
    it('should delete processed files excluding failed ones', fakeAsync(async () => {
      service.pendingCryptingFiles = [...mockFiles];
      const failedFiles = [mockFiles[0]];

      const deletePromise = service.deleteProcessedFilesExcludingFailed(failedFiles);

      tick();

      await deletePromise;

      expect(mockElectron.deleteFiles).toHaveBeenCalledWith([mockFiles[1]]);
      expect(mockFilesService.syncFilesWithFileSystem).toHaveBeenCalled();
    }));

    it('should handle file deletion after successful encryption', async () => {
      service.pendingCryptingFiles = [...mockFiles];

      await service.encryptFiles('password', 'keyPath', true, false);

      expect(mockElectron.deleteFiles).toHaveBeenCalled();
      expect(mockFilesService.syncFilesWithFileSystem).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle archive creation failure', async () => {
      service.pendingCryptingFiles = [...mockFiles];
      mockArchivatorService.archive.and.rejectWith(new Error('Archive failed'));

      await expectAsync(service.encryptFiles('password', 'keyPath', false, true))
        .toBeRejected();
    });

    it('should handle extract failure', async () => {
      service.pendingCryptingFiles = [mockEncryptedFiles[0]];
      mockArchivatorService.extract.and.rejectWith(new Error('Extract failed'));

      await expectAsync(service.decryptFiles('password', 'keyPath', false))
        .toBeRejected();
    });
  });

  describe('Processing Results', () => {
    it('should return correct processing results for mixed success/failure', async () => {
      service.pendingCryptingFiles = [...mockFiles];
      mockElectron.encryptFile
        .and.returnValues(
        Promise.resolve({ success: true, message: 'OK' }),
        Promise.resolve({ success: false, message: 'Error' })
      );

      const result = await service.encryptFiles('password', 'keyPath', false, false);

      expect(result.okCount).toBe(1);
      expect(result.failCount).toBe(1);
      expect(result.failedFiles).toEqual([mockFiles[1]]);
    });
  });
});
