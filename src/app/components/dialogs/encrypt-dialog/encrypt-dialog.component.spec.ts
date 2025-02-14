import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EncryptDialogComponent } from './encrypt-dialog.component';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../services/dialog.service';
import { FileEncryptionService } from '../../../services/file-encryption.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoadingService } from '../../../services/loading.service';
import { BehaviorSubject } from 'rxjs';

describe('EncryptDialogComponent', () => {
  let component: EncryptDialogComponent;
  let fixture: ComponentFixture<EncryptDialogComponent>;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockFileEncryptionService: jasmine.SpyObj<FileEncryptionService>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;

  beforeEach(async () => {
    (window as any).electron = {
      selectKeyDialog: jasmine.createSpy('selectKeyDialog').and.returnValue(Promise.resolve(''))
    };

    mockDialogService = jasmine.createSpyObj('DialogService', ['hideEncryptDialog'], {
      encryptDialogVisible$: new BehaviorSubject<boolean>(false)
    });

    mockFileEncryptionService = jasmine.createSpyObj('FileEncryptionService', ['encryptFiles'], {
      pendingCryptingFiles: []
    });

    mockLoadingService = jasmine.createSpyObj('LoadingService', ['show', 'hide'], {
      loading$: new BehaviorSubject<boolean>(false)
    });

    await TestBed.configureTestingModule({
      imports: [
        EncryptDialogComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        MessageService,
        { provide: DialogService, useValue: mockDialogService },
        { provide: FileEncryptionService, useValue: mockFileEncryptionService },
        { provide: LoadingService, useValue: mockLoadingService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EncryptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as any).electron;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
