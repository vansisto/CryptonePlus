import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecryptDialogComponent } from './decrypt-dialog.component';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from 'primeng/api';
import { FileEncryptionService } from '../../../services/file-encryption.service';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingService } from '../../../services/loading.service';
import { BehaviorSubject } from 'rxjs';

describe('DecryptDialogComponent', () => {
  let component: DecryptDialogComponent;
  let fixture: ComponentFixture<DecryptDialogComponent>;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockFileEncryptionService: jasmine.SpyObj<FileEncryptionService>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;

  beforeEach(async () => {
    (window as any).electron = {
      selectKeyDialog: jasmine.createSpy('selectKeyDialog').and.returnValue(Promise.resolve(''))
    };

    mockDialogService = jasmine.createSpyObj('DialogService',
        ['hideDecryptDialog'],
        {
          decryptDialogVisible$: new BehaviorSubject<boolean>(false)
        }
    );

    mockFileEncryptionService = jasmine.createSpyObj('FileEncryptionService',
        ['decryptFiles'],
        {
          pendingCryptingFiles: []
        }
    );

    mockLoadingService = jasmine.createSpyObj('LoadingService',
        ['show', 'hide'],
        {
          loading$: new BehaviorSubject<boolean>(false)
        }
    );

    await TestBed.configureTestingModule({
      imports: [
        DecryptDialogComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        MessageService,
        { provide: DialogService, useValue: mockDialogService },
        { provide: FileEncryptionService, useValue: mockFileEncryptionService },
        { provide: LoadingService, useValue: mockLoadingService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DecryptDialogComponent);
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
