import { InputFile } from "../interfaces/input-file";
import {FileSizeConverterUtil} from '../utils/file-size-converter-util';

export class CFile {
  path: string;
  name: string;
  type: string;
  formattedSize: string;
  size: number;

  constructor(path: string, name: string, type: string, size: number) {
    this.path = path;
    this.name = name;
    this.type = type;
    this.size = size;
    this.formattedSize = FileSizeConverterUtil.formatFileSize(size);
  }

  static fromInputFile(inputFile: InputFile): CFile {
    return new CFile(
      inputFile.path,
      inputFile.name,
      inputFile.type,
      inputFile.size,
    )
  }
}
