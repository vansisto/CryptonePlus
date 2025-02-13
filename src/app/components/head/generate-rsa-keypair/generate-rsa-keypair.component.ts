import {Component, OnInit} from '@angular/core';
import {Dialog} from 'primeng/dialog';
import {Checkbox} from 'primeng/checkbox';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Button} from 'primeng/button';
import {MessageService, PrimeTemplate} from 'primeng/api';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {NgIf} from '@angular/common';
import {KeyPairsService} from '../../../services/key-pairs.service';
import {Tooltip} from 'primeng/tooltip';

@Component({
  selector: 'app-generate-rsa-keypair',
  imports: [
    Dialog,
    Checkbox,
    FormsModule,
    PrimeTemplate,
    ReactiveFormsModule,
    FloatLabel,
    InputText,
    Button,
    TranslatePipe,
    NgIf,
    Tooltip
  ],
  templateUrl: './generate-rsa-keypair.component.html',
  styleUrl: './generate-rsa-keypair.component.scss'
})
export class GenerateRsaKeypairComponent implements OnInit {
  electron: any = (window as any).electron;
  visible: boolean = false;
  useCustomName: boolean = false;
  isDifferentKeysNames: boolean = false;
  customName: string = '';
  publicKeyName: string = '';
  privateKeyName: string = '';
  formGroup!: FormGroup;

  constructor(
    private readonly keyPairsService: KeyPairsService,
    private readonly messageService: MessageService,
    private readonly translateService: TranslateService,
  ) {}

  ngOnInit() {
    this.formGroup = new FormGroup({
      ownKeyPairName: new FormControl<string | null>(null)
    })
  }

  open() {
    this.visible = true;
  }

  onGenerateClick() {
    let keyPairName: string = this.buildKeyPairName();
    this.electron.send('create-rsa-keypair-folder', keyPairName);
    if (this.isDifferentKeysNames) {
      this.handleStartedGeneration();
      this.electron.generateKeysWithDifferentNames(this.publicKeyName, this.privateKeyName)
        .then((keypairFolderName: string) => {
          this.handleFinishGeneration(keypairFolderName);
        });
    } else {
      this.handleStartedGeneration();
      this.electron.generateKeyPair(keyPairName).then(() => {
        this.handleFinishGeneration(keyPairName);
      });
    }
  }

  private handleFinishGeneration(keypairFolderName: string) {
    this.keyPairsService.checkKeysFolderExisting();
    this.electron.send('open-keys-folder', keypairFolderName);
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant("TOASTS.SUCCESS_TITLE"),
      detail: this.translateService.instant("TOASTS.GENERATE_KEY_PAIR.SUCCESS")
    });
  }

  private handleStartedGeneration() {
    this.visible = false;
    this.messageService.add({
      severity: 'info',
      summary: this.translateService.instant("TOASTS.GENERATE_KEY_PAIR.IN_PROGRESS_TITLE"),
      detail: this.translateService.instant("TOASTS.GENERATE_KEY_PAIR.IN_PROGRESS_MESSAGE")
    });
  }

  private buildKeyPairName(): string {
    let keyPairName: string;
    if (!this.useCustomName) {
      keyPairName = this.buildDateTimeBasedKeyPairName();
    } else {
      keyPairName = this.isDifferentKeysNames ? this.buildDifferentNamesBasedKeyPairName() : this.customName.trim()
      if (!keyPairName) {
        keyPairName = this.buildDateTimeBasedKeyPairName();
      }
    }

    return keyPairName;
  }

  private buildDateTimeBasedKeyPairName() {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yy = now.getFullYear().toString().slice(-2);
    return `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${yy}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  }

  private buildDifferentNamesBasedKeyPairName() {
    return `${this.privateKeyName}_${this.publicKeyName}`;
  }
}
