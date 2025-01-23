import {Component, OnInit} from '@angular/core';
import {Dialog} from 'primeng/dialog';
import {Checkbox} from 'primeng/checkbox';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Button} from 'primeng/button';
import {PrimeTemplate} from 'primeng/api';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-generat-rsa-keypair',
  imports: [
    Dialog,
    Checkbox,
    FormsModule,
    PrimeTemplate,
    ReactiveFormsModule,
    FloatLabel,
    InputText,
    Button,
    TranslatePipe
  ],
  templateUrl: './generat-rsa-keypair.component.html',
  styleUrl: './generat-rsa-keypair.component.scss'
})
export class GeneratRsaKeypairComponent implements OnInit {
  electron: any = (window as any).electron;
  visible: boolean = false;
  useCustomName: boolean = false;
  customName: string = '';
  formGroup!: FormGroup;

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
    this.electron.generateKeyPair(keyPairName);
    this.visible = false;
    this.electron.send('open-keys-folder', keyPairName);
  }

  private buildKeyPairName(): string {
    let keyPairName: string;
    if (!this.useCustomName) {
      keyPairName = this.buildDateTimeBasedKeyPairName();
    } else {
      keyPairName = this.customName.trim()
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
}
