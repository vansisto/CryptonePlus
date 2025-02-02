import {CFile} from '../models/cfile';

export interface ProcessingResult {
  okCount: number,
  failCount: number,
  failedFiles: CFile[]
}
