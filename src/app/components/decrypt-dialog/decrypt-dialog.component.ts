import {Component, OnInit} from '@angular/core';
import {Dialog} from 'primeng/dialog';
import {FloatLabel} from 'primeng/floatlabel';
import {FormsModule} from '@angular/forms';
import {Button} from 'primeng/button';
import {Password} from 'primeng/password';
import {Checkbox} from 'primeng/checkbox';
import {InputText} from 'primeng/inputtext';
import {MessageService, PrimeTemplate} from 'primeng/api';
import {EncryptDialogService} from '../../services/encrypt-dialog.service';
import {FilesService} from '../../services/files.service';
import {CFile} from '../../models/cfile';

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
  doDeleteEncryptedFile: boolean = true;
  dialogVisible: boolean = false;

  constructor(
    private encryptDialogService: EncryptDialogService,
    private filesService: FilesService,
    private messageService: MessageService,
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
    this.filesService
      .decrypt(this.password, this.keyPath)
      .then(result => {
        this.showResultToast(result);
        if (this.doDeleteEncryptedFile) {
          this.filesService.deleteFilesToDecrypt()
            .then(() => {
              this.filesService.removeDeletedFilesFromTable();
              this.filesService.clearFilesToDecryptFromMemory();
            });
        } else {
          this.filesService.clearFilesToDecryptFromMemory();
        }
      })
    this.encryptDialogService.hideDecryptDialog();
  }

  private showResultToast(result: {
    decryptedCount: number;
    failCount: number;
    failedFiles: CFile[]
  }) {
    const hasFailed = result.failCount > 0;
    const allFailed = result.failCount > 0 && result.decryptedCount === 0;
    let summary = 'Success';
    let severity = 'success';
    let message = 'Files decrypted successfully';
    if (hasFailed) {
      summary = 'Warning';
      severity = 'warn';
      message = `Files decrypted [${result.decryptedCount}].
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
}
