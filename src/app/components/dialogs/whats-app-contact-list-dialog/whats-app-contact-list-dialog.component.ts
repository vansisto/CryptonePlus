import {Component, OnInit} from '@angular/core';
import {Dialog} from 'primeng/dialog';
import {Listbox} from 'primeng/listbox';
import {FormsModule} from '@angular/forms';
import {DialogService} from '../../../services/dialog.service';
import {CContact} from '../../../models/ccontact';
import {WhatsAppService} from '../../../services/whats-app.service';
import {MessageService, PrimeTemplate} from 'primeng/api';
import {SendFilesService} from '../../../services/send-files.service';
import {Button} from 'primeng/button';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-whats-app-contact-list-dialog',
  imports: [
    Dialog,
    Listbox,
    FormsModule,
    Button,
    PrimeTemplate,
    TranslatePipe,
    NgIf
  ],
  templateUrl: './whats-app-contact-list-dialog.component.html',
  styleUrl: './whats-app-contact-list-dialog.component.scss'
})
export class WhatsAppContactListDialogComponent implements OnInit{
  electron = (window as any).electron;
  whatsAppContactListDialogVisible: boolean = false;
  cContacts: CContact[] = [];
  cContact: CContact | null = null;

  constructor(
    private readonly dialogService: DialogService,
    private readonly whatsAppService: WhatsAppService,
    private readonly sendFilesService: SendFilesService,
    private readonly messageService: MessageService,
    private readonly translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.dialogService.whatsAppContactListDialogVisible$.subscribe(value => {
      this.whatsAppContactListDialogVisible = value;
    });
    this.whatsAppService.ccontacts$.subscribe(contacts => {
      this.cContacts = contacts;
    })
  }

  send() {
    this.dialogService.hideWhatsAppContactListDialog();
    this.whatsAppService.isWhatsAppLoadingSubject.next(true);
    this.sendFilesService.sendFiles(this.cContact as CContact)
      .then((result: {status: string, reason: string}) => {
        if (result.status === 'ok') {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'File sent successfully'
          });
        } else if (result.status === 'error' && result.reason === 'ERR_FS_FILE_TOO_LARGE') {
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant("TOASTS.ERROR_TITLE"),
            detail: this.translateService.instant("TOASTS.WHATSAPP.FILE_TOO_LARGE")
          });
          this.dialogService.showWhatsAppFileTooLargeDialog();
        }
        this.whatsAppService.isWhatsAppLoadingSubject.next(false);
        this.dialogService.hideWhatsAppContactListDialog();
        this.sendFilesService.filesToSend = [];
        this.cContact = null;
      });
  }
}
