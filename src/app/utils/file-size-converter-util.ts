export class FileSizeConverterUtil {
  static formatFileSize(sizeBytes: number): string {
    if (sizeBytes < 1024) {
      return sizeBytes + ' B';
    } else if (sizeBytes < 1024 * 1024) {
      return (sizeBytes / 1024).toFixed(2) + ' KB';
    } else if (sizeBytes < 1024 * 1024 * 1024) {
      return (sizeBytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      return (sizeBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
  }
}
