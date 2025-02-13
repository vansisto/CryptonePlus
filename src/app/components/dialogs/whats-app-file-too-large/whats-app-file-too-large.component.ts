import {Component, OnInit} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {Dialog} from 'primeng/dialog';
import {DialogService} from '../../../services/dialog.service';

@Component({
  selector: 'app-whats-app-file-too-large',
  imports: [
    TranslatePipe,
    Dialog
  ],
  templateUrl: './whats-app-file-too-large.component.html',
  styleUrl: './whats-app-file-too-large.component.scss'
})
export class WhatsAppFileTooLargeComponent implements OnInit {
  isVisible: boolean = false

  constructor(
    private readonly dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.dialogService.whatsAppFileTooLargeDialogVisible$.subscribe(isVisible => {
      this.isVisible = isVisible
    })
  }
}
