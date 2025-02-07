import {Component, NgZone, OnInit} from '@angular/core';
import {CFile} from '../../models/cfile';
import {TableModule} from 'primeng/table';
import {TranslatePipe} from '@ngx-translate/core';
import {InputFile} from '../../interfaces/input-file'
import {Button} from 'primeng/button';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {Tooltip} from 'primeng/tooltip';
import {FilesService} from '../../services/files.service';
import {DialogService} from '../../services/dialog.service';
import {FileEncryptionService} from '../../services/file-encryption.service';
import {Popover} from 'primeng/popover';
import { QRCodeComponent } from 'angularx-qrcode';
import {Dialog} from 'primeng/dialog';
import {ProgressSpinner} from 'primeng/progressspinner';
import {FormsModule} from '@angular/forms';
import {SendFilesService} from '../../services/send-files.service';
import {WhatsAppService} from '../../services/whats-app.service';

@Component({
  selector: 'app-files-table',
  imports: [
    TableModule,
    Button,
    NgIf,
    Tooltip,
    TranslatePipe,
    Popover,
    NgOptimizedImage,
    QRCodeComponent,
    Dialog,
    ProgressSpinner,
    FormsModule,
  ],
  templateUrl: './files-table.component.html',
  styleUrl: './files-table.component.scss'
})
export class FilesTableComponent implements OnInit {
  electron = (window as any).electron;
  allFiles!: CFile[];
  selectedFiles: CFile[] = [];
  isWhatsAppLoading: boolean = false;

  constructor(
    private readonly ngZone: NgZone,
    private readonly filesService: FilesService,
    private readonly fileEncryptionService: FileEncryptionService,
    private readonly dialogService: DialogService,
    private readonly sendFilesService: SendFilesService,
    private readonly whatsAppService: WhatsAppService,
  ) {}

  ngOnInit() {
    this.subscribeToAllFiles();
    this.subscribeToSelectedFiles();
    this.setupElectronHandlers();

    this.whatsAppService.isWhatsAppLoading$.subscribe(value => {
      this.isWhatsAppLoading = value;
    });

    this.electron.send('get-pending-files');
  }

  private subscribeToAllFiles(): void {
    this.filesService.allFiles$.subscribe(files => {
      this.ngZone.run(() => {
        this.allFiles = files;
      });
    });
  }

  private subscribeToSelectedFiles(): void {
    this.filesService.selectedFiles$.subscribe(files => {
      this.selectedFiles = files;
    });
  }

  removeFile(file: CFile) {
    this.filesService.removeFileFromAll(file);
  }

  showEncryptDialog(cfile: CFile) {
    this.fileEncryptionService.addFileToPending(cfile);
    this.dialogService.showEncryptDialog();
  }

  showDecryptDialog(cfile: CFile) {
    this.fileEncryptionService.addFileToPending(cfile);
    this.dialogService.showDecryptDialog();
  }

  onSelectionChange(selectedFiles: CFile[]) {
    this.filesService.updateSelectedFiles(selectedFiles);
    this.sendFilesService.filesToSend = selectedFiles;
  }

  private setupElectronHandlers(): void {
    this.electron.receive('add-files', (inputFiles: InputFile[]) => this.addFiles(inputFiles));
  }

  private addFiles(inputFiles: InputFile[]) {
    if (!inputFiles) return;

    this.ngZone.run(() => {
      inputFiles.forEach(inputFile => this.addFile(inputFile));
    });
  }

  private addFile(inputFile: InputFile) {
    const exists = this.allFiles.some(f => f.path === inputFile.path);
    if (!exists) {
      const newCFile = CFile.fromInputFile(inputFile);
      this.filesService.addFileToAll(newCFile);
      this.selectedFiles = this.selectedFiles.filter(file => file.path !== newCFile.path);
    }
  }

  sendViaWhatsApp(cfile: CFile) {
    this.whatsAppService.sendViaWhatsApp([cfile]);
  }

  sendViaSignal(cfile: CFile) {

  }

  sendViaThreema(cfile: CFile) {

  }

  openFolderWithSelectedFile(cfile: CFile) {
    this.electron.showFileInFolder(cfile);
  }
}
