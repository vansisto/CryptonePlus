import {Component, OnInit} from '@angular/core';
import {Button} from "primeng/button";
import {Checkbox} from "primeng/checkbox";
import {Dialog} from "primeng/dialog";
import {FloatLabel} from "primeng/floatlabel";
import {FormsModule} from "@angular/forms";
import {InputText} from "primeng/inputtext";
import {Password} from "primeng/password";
import {MessageService, PrimeTemplate} from "primeng/api";
import {CryptoDialogService} from '../../services/crypto-dialog.service';
import {CFile} from '../../models/cfile';
import {FileEncryptionService} from '../../services/file-encryption.service';

@Component({
  selector: 'app-encrypt-dialog',
  imports: [
    Button,
    Checkbox,
    Dialog,
    FloatLabel,
    FormsModule,
    InputText,
    Password,
    PrimeTemplate,
  ],
  templateUrl: './encrypt-dialog.component.html',
  styleUrl: './encrypt-dialog.component.scss'
})
export class EncryptDialogComponent implements OnInit {
  electron = (window as any).electron;
  encryptDialogVisible: boolean = false;
  deleteAfter: boolean = false;
  keyPath: string = "";
  password: string = "";

  constructor(
    private readonly encryptDialogService: CryptoDialogService,
    private readonly messageService: MessageService,
    private readonly fileEncryptionService: FileEncryptionService
  ) {}

  ngOnInit(): void {
    this.encryptDialogService.encryptDialogVisible$.subscribe(value => {
      this.encryptDialogVisible = value;
    });
  }

  encrypt() {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'File encryption started...' })
    this.fileEncryptionService.encryptFiles(this.password, this.keyPath, this.deleteAfter)
      .then(result => {
        this.showResultToast(result);
        this.encryptDialogService.hideEncryptDialog();
      });
  }

  openKeysFolder(isPublic: boolean = true) {
    this.electron.selectKeyDialog(isPublic).then((key: string) => {
      if (isPublic) this.keyPath = key;
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
      let message = 'Files encrypted successfully';
      if (hasFailed) {
        summary = 'Warning';
        severity = 'warn';
        message = `Files encrypted [${result.okCount}].
        Files failed [${result.failCount}].
        Failed files ${JSON.stringify(result.failedFiles.map(cfile => cfile.name))}`
      }
      if (allFailed) {
        summary = 'Error';
        severity = 'error';
        message = 'Files have not been encrypted';
      }
      this.messageService.add({severity: severity, summary: summary, detail: message});
  }

  clearFilesToProcess() {
    this.fileEncryptionService.pendingCryptingFiles = [];
  }
}
