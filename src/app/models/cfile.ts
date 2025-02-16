import { InputFile } from "../interfaces/input-file";
import {FileSizeConverterUtil} from '../utils/file-size-converter-util';

export class CFile {
  public formattedSize: string;

  constructor(public path: string, public name: string, public encrypted: boolean, public size: number) {
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
