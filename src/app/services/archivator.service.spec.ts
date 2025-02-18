import { TestBed } from '@angular/core/testing';
import { ArchivatorService } from './archivator.service';
import { CFile } from '../models/cfile';

describe('ArchivatorService', () => {
  let service: ArchivatorService;
  let mockElectron: any;

  const mockFiles: CFile[] = [
    new CFile(
      '/path/to/test1.txt',
      'test1.txt',
      false,
      1024
    ),
    new CFile(
      '/path/to/test2.jpg',
      'test2.jpg',
      false,
      2048
    )
  ];

  const mockArchiveResult: CFile = new CFile(
    '/path/to/archive.zip',
    'archive.zip',
    false,
    3072
  );

  beforeEach(() => {
    mockElectron = {
      archiveFiles: jasmine.createSpy('archiveFiles')
        .and.returnValue(Promise.resolve(mockArchiveResult)),
      unarchiveIfExists: jasmine.createSpy('unarchiveIfExists')
        .and.returnValue(Promise.resolve())
    };

    (window as any).electron = mockElectron;

    TestBed.configureTestingModule({
      providers: [ArchivatorService]
    });

    service = TestBed.inject(ArchivatorService);
  });

  afterEach(() => {
    delete (window as any).electron;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('archive()', () => {
    it('should archive files successfully', async () => {
      const result = await service.archive(mockFiles);

      expect(mockElectron.archiveFiles).toHaveBeenCalledWith(mockFiles);
      expect(result).toEqual(mockArchiveResult);
      expect(result.formattedSize).toBeDefined();
    });

    it('should handle empty files array', async () => {
      await service.archive([]);

      expect(mockElectron.archiveFiles).toHaveBeenCalledWith([]);
    });

    it('should propagate errors from electron', async () => {
      const error = new Error('Archive failed');
      mockElectron.archiveFiles.and.returnValue(Promise.reject(error));

      await expectAsync(service.archive(mockFiles)).toBeRejectedWith(error);
    });
  });

  describe('extract()', () => {
    const testArchivePath = '/path/to/test.zip';

    it('should extract archive successfully', async () => {
      await service.extract(testArchivePath);

      expect(mockElectron.unarchiveIfExists).toHaveBeenCalledWith(testArchivePath);
    });

    it('should handle non-existent archive', async () => {
      mockElectron.unarchiveIfExists.and.returnValue(Promise.resolve());

      await service.extract('non-existent.zip');

      expect(mockElectron.unarchiveIfExists).toHaveBeenCalledWith('non-existent.zip');
    });

    it('should propagate errors from electron', async () => {
      const error = new Error('Extract failed');
      mockElectron.unarchiveIfExists.and.returnValue(Promise.reject(error));

      await expectAsync(service.extract(testArchivePath)).toBeRejectedWith(error);
    });
  });

  describe('electron integration', () => {
    it('should have electron property initialized', () => {
      expect(service.electron).toBeDefined();
      expect(service.electron).toBe(mockElectron);
    });

    it('should handle electron methods correctly', () => {
      expect(service.electron.archiveFiles).toBeDefined();
      expect(service.electron.unarchiveIfExists).toBeDefined();
    });
  });
});
