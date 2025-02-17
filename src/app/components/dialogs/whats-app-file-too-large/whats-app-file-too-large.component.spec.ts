import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhatsAppFileTooLargeComponent } from './whats-app-file-too-large.component';
import { DialogService } from '../../../services/dialog.service';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

describe('WhatsAppFileTooLargeComponent', () => {
  let component: WhatsAppFileTooLargeComponent;
  let fixture: ComponentFixture<WhatsAppFileTooLargeComponent>;
  let mockDialogService: jasmine.SpyObj<DialogService>;

  beforeEach(async () => {
    mockDialogService = jasmine.createSpyObj('DialogService', [], {
      whatsAppFileTooLargeDialogVisible$: new BehaviorSubject<boolean>(false)
    });

    await TestBed.configureTestingModule({
      imports: [
        WhatsAppFileTooLargeComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DialogService, useValue: mockDialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WhatsAppFileTooLargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
