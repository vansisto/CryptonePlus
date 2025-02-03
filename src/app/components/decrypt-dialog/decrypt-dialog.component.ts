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
import {FileEncryptionService} from '../../services/file-encryption.service';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ProcessingResult} from '../../interfaces/processing-result';
import {LoadingService} from '../../services/loading.service';

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
    TranslatePipe,
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
  loading: boolean = false;

  constructor(
    private readonly encryptDialogService: CryptoDialogService,
    private readonly messageService: MessageService,
    private readonly fileEncryptionService: FileEncryptionService,
    private readonly translateService: TranslateService,
    private readonly loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.encryptDialogService.decryptDialogVisible$.subscribe(value => {
      this.dialogVisible = value;
    });
    this.loadingService.loading$.subscribe(value => {
      this.loading = value;
    })
  }

  openKeysFolder(isPublic: boolean = true) {
    this.electron.selectKeyDialog(isPublic).then((key: string) => {
      if (!isPublic) this.keyPath = key;
    });
  }

  decrypt() {
    this.loadingService.show();
    this.messageService.add({ severity: 'info', summary: 'Info', detail: this.translateService.instant("TOASTS.DECRYPT.STARTED_MESSAGE") })
    this.fileEncryptionService.decryptFiles(this.password, this.keyPath, this.deleteAfter)
      .then(result => {
        this.showResultToast(result);
        this.encryptDialogService.hideDecryptDialog();
        this.loadingService.hide();
      });
  }

  private showResultToast(result: ProcessingResult) {
      const hasFailed: boolean = result.failCount > 0;
      const allFailed: boolean = result.failCount > 0 && result.okCount === 0;
      let summary: string = this.translateService.instant('TOASTS.SUCCESS_TITLE');
      let severity: string = 'success';
      let message: string = this.translateService.instant('TOASTS.DECRYPT.SUCCESS_MESSAGE');
      if (hasFailed) {
        summary = this.translateService.instant('TOASTS.WARNING_TITLE');
        severity = 'warn';
        message = this.translateService.instant("TOASTS.DECRYPT.FILES_DONE_MESSAGE") + ` [${result.okCount}]. `
        + this.translateService.instant("TOASTS.DECRYPT.FILES_FAILED_MESSAGE") + ` [${result.failCount}]. `
        + this.translateService.instant("TOASTS.DECRYPT.FAILED_FILES_MESSAGE") + ` : ${JSON.stringify(result.failedFiles.map(cfile => cfile.name))}.`
      }
      if (allFailed) {
        summary = this.translateService.instant("TOASTS.ERROR_TITLE");
        severity = 'error';
        message = this.translateService.instant("TOASTS.DECRYPT.ERROR_MESSAGE");
      }
      this.messageService.add({severity: severity, summary: summary, detail: message});
  }

  clearFilesToProcess() {
    this.fileEncryptionService.pendingCryptingFiles = [];
  }
}
