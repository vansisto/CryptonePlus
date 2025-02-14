import { FileSizeConverterUtil } from './file-size-converter-util';

describe('FileSizeConverterUtil', () => {
  describe('formatFileSize', () => {
    const ONE_KB = 1024;
    const ONE_MB = ONE_KB * ONE_KB;
    const ONE_GB = ONE_KB * ONE_KB * ONE_KB;

    it('should format bytes correctly', () => {
      expect(FileSizeConverterUtil.formatFileSize(0)).toBe('0 B');
      expect(FileSizeConverterUtil.formatFileSize(512)).toBe('512 B');
      expect(FileSizeConverterUtil.formatFileSize(1023)).toBe('1023 B');
    });

    it('should format kilobytes correctly', () => {
      expect(FileSizeConverterUtil.formatFileSize(ONE_KB)).toBe('1.00 KB');
      expect(FileSizeConverterUtil.formatFileSize(1536)).toBe('1.50 KB');
      expect(FileSizeConverterUtil.formatFileSize(ONE_KB * 1023)).toBe('1023.00 KB');
    });

    it('should format megabytes correctly', () => {
      expect(FileSizeConverterUtil.formatFileSize(ONE_MB)).toBe('1.00 MB');
      expect(FileSizeConverterUtil.formatFileSize(1.5 * ONE_MB)).toBe('1.50 MB');
      expect(FileSizeConverterUtil.formatFileSize(ONE_MB * 1023)).toBe('1023.00 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(FileSizeConverterUtil.formatFileSize(ONE_GB)).toBe('1.00 GB');
      expect(FileSizeConverterUtil.formatFileSize(1.5 * ONE_GB)).toBe('1.50 GB');
      expect(FileSizeConverterUtil.formatFileSize(2 * ONE_GB)).toBe('2.00 GB');
    });
  });
});
