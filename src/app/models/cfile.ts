import { InputFile } from "../interfaces/input-file";
import {FileSizeConverterUtil} from '../utils/file-size-converter-util';

export class CFile {
  path: string;
  name: string;
  encrypted: boolean;
  formattedSize: string;
  size: number;

  constructor(path: string, name: string, encrypted: boolean, size: number) {
    this.path = path;
    this.name = name;
    this.encrypted = encrypted;
    this.size = size;
    this.formattedSize = FileSizeConverterUtil.formatFileSize(size);
  }

  static fromInputFile(inputFile: InputFile): CFile {
    return new CFile(
      inputFile.path,
      inputFile.name,
      inputFile.encrypted,
      inputFile.size,
    )
  }
}
