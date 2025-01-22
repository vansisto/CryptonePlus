import { InputFile } from "../interfaces/input-file";
import {FileSizeConverterUtil} from '../utils/file-size-converter-util';

export class CFile {
  path: string;
  name: string;
  type: string;
  size: string;

  constructor(path: string, name: string, type: string, size: string) {
    this.path = path;
    this.name = name;
    this.type = type;
    this.size = size;
  }

  static fromInputFile(inputFile: InputFile): CFile {
    return new CFile(
      inputFile.path,
      inputFile.name,
      inputFile.type,
      FileSizeConverterUtil.formatFileSize(inputFile.size)
    )
  }
}
