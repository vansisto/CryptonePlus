import {Component, OnInit} from '@angular/core';
import {Dialog} from 'primeng/dialog';
import {Checkbox} from 'primeng/checkbox';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Button} from 'primeng/button';
import {PrimeTemplate} from 'primeng/api';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';

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
    Button
  ],
  templateUrl: './generat-rsa-keypair.component.html',
  styleUrl: './generat-rsa-keypair.component.scss'
})
export class GeneratRsaKeypairComponent implements OnInit {
  visible: boolean = false;
  useCustomName: boolean = false;
  customName: string = '';
  electron: any = (window as any).electron;
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
    let folderName: string;
    if (!this.useCustomName) {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const yy = now.getFullYear().toString().slice(-2);
      folderName = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${yy}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    } else {
      folderName = this.customName.trim()
      if (!folderName) {
        return
      }
    }

    this.electron.send('generate-rsa-keypair', folderName);
    this.visible = false;
    this.electron.send('open-keys-folder', folderName);
  }
}
