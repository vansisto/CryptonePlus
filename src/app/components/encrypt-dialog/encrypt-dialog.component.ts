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
import {FileEncryptionService} from '../../services/file-encryption.service';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ProcessingResult} from "../../interfaces/processing-result";

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
    TranslatePipe,
  ],
  templateUrl: './encrypt-dialog.component.html',
  styleUrl: './encrypt-dialog.component.scss'
})
export class EncryptDialogComponent implements OnInit {
  electron = (window as any).electron;
  encryptDialogVisible: boolean = false;
  deleteAfter: boolean = false;
  doArchive: boolean = false;
  keyPath: string = "";
  password: string = "";

  constructor(
    private readonly encryptDialogService: CryptoDialogService,
    private readonly messageService: MessageService,
    private readonly fileEncryptionService: FileEncryptionService,
    private readonly translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.encryptDialogService.encryptDialogVisible$.subscribe(value => {
      this.encryptDialogVisible = value;
    });
  }

  encrypt() {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: this.translateService.instant("TOASTS.ENCRYPT.STARTED_MESSAGE") })
    this.fileEncryptionService.encryptFiles(this.password, this.keyPath, this.deleteAfter, this.doArchive)
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

  private showResultToast(result: ProcessingResult) {
      const hasFailed: boolean = result.failCount > 0;
      const allFailed: boolean = result.failCount > 0 && result.okCount === 0;
      let summary: string = this.translateService.instant('TOASTS.SUCCESS_TITLE');
      let severity: string = 'success';
      let message: string = this.translateService.instant('TOASTS.ENCRYPT.SUCCESS_MESSAGE');
      if (hasFailed) {
        summary = this.translateService.instant('TOASTS.WARNING_TITLE');
        severity = 'warn';
        message = this.translateService.instant("TOASTS.ENCRYPT.FILES_DONE_MESSAGE") + ` [${result.okCount}]. `
        + this.translateService.instant("TOASTS.ENCRYPT.FILES_FAILED_MESSAGE") + ` [${result.failCount}]. `
        + this.translateService.instant("TOASTS.ENCRYPT.FAILED_FILES_MESSAGE") + ` : ${JSON.stringify(result.failedFiles.map(cfile => cfile.name))}.`
      }
      if (allFailed) {
        summary = this.translateService.instant("TOASTS.ERROR_TITLE");
        severity = 'error';
        message = this.translateService.instant("TOASTS.ENCRYPT.ERROR_MESSAGE");
      }
      this.messageService.add({severity: severity, summary: summary, detail: message});
  }

  clearFilesToProcess() {
    this.fileEncryptionService.pendingCryptingFiles = [];
  }
}
