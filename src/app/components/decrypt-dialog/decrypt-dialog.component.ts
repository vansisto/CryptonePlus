import {Component, OnInit} from '@angular/core';
import {Dialog} from 'primeng/dialog';
import {FloatLabel} from 'primeng/floatlabel';
import {FormsModule} from '@angular/forms';
import {Button} from 'primeng/button';
import {Password} from 'primeng/password';
import {Checkbox} from 'primeng/checkbox';
import {InputText} from 'primeng/inputtext';
import {MessageService, PrimeTemplate} from 'primeng/api';
import {CryptoDialogService} from '../../services/crypto-dialog.service';
import {CFile} from '../../models/cfile';
import {FileEncryptionService} from '../../services/file-encryption.service';

@Component({
  selector: 'app-decrypt-dialog',
  imports: [
    Dialog,
    FloatLabel,
    FormsModule,
    Button,
    Password,
    Checkbox,
    InputText,
    PrimeTemplate,
  ],
  templateUrl: './decrypt-dialog.component.html',
  styleUrl: './decrypt-dialog.component.scss'
})
export class DecryptDialogComponent implements OnInit {
  electron = (window as any).electron;
  keyPath: string = "";
  password: string = "";
  deleteAfter: boolean = true;
  dialogVisible: boolean = false;

  constructor(
    private encryptDialogService: CryptoDialogService,
    private messageService: MessageService,
    private fileEncryptionService: FileEncryptionService,
  ) {}

  ngOnInit(): void {
    this.encryptDialogService.decryptDialogVisible$.subscribe(value => {
      this.dialogVisible = value;
    });
  }

  openKeysFolder(isPublic: boolean = true) {
    this.electron.selectKeyDialog(isPublic).then((key: string) => {
      if (!isPublic) this.keyPath = key;
    });
  }

  decrypt() {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'File decryption started...' })
    this.fileEncryptionService.decryptFiles(this.password, this.keyPath, this.deleteAfter)
      .then(result => {
        this.showResultToast(result);
        this.encryptDialogService.hideDecryptDialog();
      });
  }

  private showResultToast(result: {
    okCount: number;
    failCount: number;
    failedFiles: CFile[]
  }) {
    const hasFailed = result.failCount > 0;
    const allFailed = result.failCount > 0 && result.okCount === 0;
    let summary = 'Success';
    let severity = 'success';
    let message = 'Files decrypted successfully';
    if (hasFailed) {
      summary = 'Warning';
      severity = 'warn';
      message = `Files decrypted [${result.okCount}].
      Files failed [${result.failCount}].
      Failed files ${JSON.stringify(result.failedFiles.map(cfile => cfile.name))}`
    }
    if (allFailed) {
      summary = 'Error';
      severity = 'error';
      message = 'Files have not been decrypted';
    }
    this.messageService.add({severity: severity, summary: summary, detail: message});
  }

  clearFilesToProcess() {
    this.fileEncryptionService.pendingCryptingFiles = [];
  }
}
