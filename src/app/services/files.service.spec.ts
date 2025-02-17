import { TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { FilesService } from './files.service';
import { CFile } from '../models/cfile';
import { NgZone } from '@angular/core';
import { firstValueFrom } from 'rxjs';

describe('FilesService', () => {
  let service: FilesService;
  let mockElectron: any;
  let ngZone: NgZone;

  const mockFiles: CFile[] = [
    new CFile('/path/test1.txt', 'test1.txt', false, 1000),
    new CFile('/path/test2.txt', 'test2.txt', false, 2000),
    new CFile('/path/test3.txt', 'test3.txt', true, 3000)
  ];

  beforeEach(() => {
    mockElectron = {
      fileExists: jasmine.createSpy('fileExists').and.returnValue(Promise.resolve(true))
    };
    (window as any).electron = mockElectron;

    TestBed.configureTestingModule({
      providers: [FilesService]
    });

    service = TestBed.inject(FilesService);
    ngZone = TestBed.inject(NgZone);
  });

  afterEach(() => {
    delete (window as any).electron;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('File Management', () => {
    it('should add file to all files', async () => {
      service.addFileToAll(mockFiles[0]);
      const files = await firstValueFrom(service.allFiles$);
      expect(files).toContain(mockFiles[0]);
    });

    it('should remove file from all files', async () => {
      service.addFileToAll(mockFiles[0]);
      service.removeFileFromAll(mockFiles[0]);
      const files = await firstValueFrom(service.allFiles$);
      expect(files).not.toContain(mockFiles[0]);
    });

    it('should update selected files', async () => {
      service.updateSelectedFiles([mockFiles[0]]);
      const selectedFiles = await firstValueFrom(service.selectedFiles$);
      expect(selectedFiles).toEqual([mockFiles[0]]);
    });

    it('should remove all files', async () => {
      service.addFileToAll(mockFiles[0]);
      service.addFileToAll(mockFiles[1]);
      service.removeAllFiles();

      const allFiles = await firstValueFrom(service.allFiles$);
      const selectedFiles = await firstValueFrom(service.selectedFiles$);

      expect(allFiles).toEqual([]);
      expect(selectedFiles).toEqual([]);
    });

    it('should remove selected files', async () => {
      service.addFileToAll(mockFiles[0]);
      service.addFileToAll(mockFiles[1]);
      service.updateSelectedFiles([mockFiles[0]]);
      service.removeSelected();

      const allFiles = await firstValueFrom(service.allFiles$);
      expect(allFiles).not.toContain(mockFiles[0]);
      expect(allFiles).toContain(mockFiles[1]);
    });
  });

  describe('File System Sync', () => {
    it('should sync with file system', async () => {
      service.addFileToAll(mockFiles[0]);
      service.addFileToAll(mockFiles[1]);

      mockElectron.fileExists.and.returnValues(
        Promise.resolve(true),
        Promise.resolve(false)
      );

      await service.syncFilesWithFileSystem();
      const files = await firstValueFrom(service.allFiles$);

      expect(files).toEqual([mockFiles[0]]);
      expect(mockElectron.fileExists).toHaveBeenCalledTimes(2);
    });

    it('should sync selected files when files are removed', async () => {
      service.addFileToAll(mockFiles[0]);
      service.addFileToAll(mockFiles[1]);
      service.updateSelectedFiles([mockFiles[0], mockFiles[1]]);

      mockElectron.fileExists.and.returnValues(
        Promise.resolve(false),
        Promise.resolve(true)
      );

      await service.syncFilesWithFileSystem();
      const selectedFiles = await firstValueFrom(service.selectedFiles$);

      expect(selectedFiles).toEqual([mockFiles[1]]);
    });
  });

  describe('File Calculations', () => {
    it('should calculate total size correctly', () => {
      service.addFileToAll(mockFiles[0]);
      service.addFileToAll(mockFiles[1]);

      expect(service.getTotalSize()).toBe(3000);
    });

    it('should return zero for empty file list', () => {
      expect(service.getTotalSize()).toBe(0);
    });
  });

  describe('NgZone Integration', () => {
    it('should run periodic sync outside Angular zone', fakeAsync(() => {
      spyOn(ngZone, 'runOutsideAngular').and.callThrough();
      service = new FilesService(ngZone);
      expect(ngZone.runOutsideAngular).toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should run sync inside Angular zone', fakeAsync(() => {
      spyOn(ngZone, 'run').and.callThrough();
      service = new FilesService(ngZone);
      tick(1000);
      expect(ngZone.run).toHaveBeenCalled();
      discardPeriodicTasks();
    }));
  });
});
