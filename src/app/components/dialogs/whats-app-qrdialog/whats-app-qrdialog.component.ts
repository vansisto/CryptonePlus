import {Component, OnInit} from '@angular/core';
import {Dialog} from 'primeng/dialog';
import {QRCodeComponent} from 'angularx-qrcode';

@Component({
  selector: 'app-whats-app-qrdialog',
  imports: [
    Dialog,
    QRCodeComponent
  ],
  templateUrl: './whats-app-qrdialog.component.html',
  styleUrl: './whats-app-qrdialog.component.scss'
})
export class WhatsAppQRDialogComponent implements OnInit {
  electron = (window as any).electron;
  whatsAppQR: string = '';
  isWhatsAppQrDialogVisible: boolean = false;

  ngOnInit(): void {
    this.electron.receive('whatsapp-qr-received', (qr: string) => {
      this.whatsAppQR = qr;
      this.isWhatsAppQrDialogVisible = true;
    });
    this.electron.receive('whatsapp-authenticated', () => {
      this.isWhatsAppQrDialogVisible = false;
    });
  }
}
