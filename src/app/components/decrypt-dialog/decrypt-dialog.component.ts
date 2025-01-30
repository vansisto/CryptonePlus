import {Component, OnInit} from '@angular/core';
import {Dialog} from 'primeng/dialog';
import {FloatLabel} from 'primeng/floatlabel';
import {FormsModule} from '@angular/forms';
import {Button} from 'primeng/button';
import {Password} from 'primeng/password';
import {Checkbox} from 'primeng/checkbox';
import {InputText} from 'primeng/inputtext';
import {PrimeTemplate} from 'primeng/api';
import {window} from 'rxjs';
import {EncryptDialogService} from '../../services/encrypt-dialog.service';
import {FilesService} from '../../services/files.service';

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
  electron: any = (window as any).electron;
  keyPath: string = "";
  password: string = "";
  doDeleteEncryptedFile: boolean = true;
  dialogVisible: boolean = false;

  constructor(
    private encryptDialogService: EncryptDialogService,
    private filesService: FilesService,
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
    // this.messageService.add({ severity: 'info', summary: 'Info', detail: 'File decryption started...' })
    // const decryptionResult: Promise<any> = this.electron.decryptFile(cfile, "pass", "C:\\Users\\vansi\\AppData\\Roaming\\cryptone\\CryptoneKeys\\Offline\\test\\test.private.key");
    //
    // decryptionResult.then(result => {
    //   const toast = result.success
    //     ? {severity: 'success', summary: 'Decrypted'}
    //     : {severity: 'error', summary: 'Error'};
    //   this.messageService.add({ severity: toast.severity, summary: toast.summary, detail: result.message })
    // })
    this.encryptDialogService.hideDecryptDialog();
    this.filesService.clearFilesToDecrypt();
  }
}
