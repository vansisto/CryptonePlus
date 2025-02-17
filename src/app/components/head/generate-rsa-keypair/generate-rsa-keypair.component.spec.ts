import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenerateRsaKeypairComponent } from './generate-rsa-keypair.component';
import { MessageService } from 'primeng/api';
import { KeyPairsService } from '../../../services/key-pairs.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

describe('GenerateRsaKeypairComponent', () => {
  let component: GenerateRsaKeypairComponent;
  let fixture: ComponentFixture<GenerateRsaKeypairComponent>;
  let mockKeyPairsService: jasmine.SpyObj<KeyPairsService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    (window as any).electron = {
      send: jasmine.createSpy('send'),
      generateKeysWithDifferentNames: jasmine.createSpy('generateKeysWithDifferentNames').and.returnValue(Promise.resolve('test-folder')),
      generateKeyPair: jasmine.createSpy('generateKeyPair').and.returnValue(Promise.resolve())
    };

    mockKeyPairsService = jasmine.createSpyObj('KeyPairsService', ['checkKeysFolderExisting']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [
        GenerateRsaKeypairComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule
      ],
      providers: [
        { provide: KeyPairsService, useValue: mockKeyPairsService },
        { provide: MessageService, useValue: mockMessageService },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GenerateRsaKeypairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as any).electron;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle key pair generation with default names', async () => {
    component.visible = true;
    component.isDifferentKeysNames = false;
    component.useCustomName = true;
    component.customName = 'test-keypair';

    await component.onGenerateClick();

    expect(component.visible).toBeFalsy();
    expect((window as any).electron.send).toHaveBeenCalledWith('create-rsa-keypair-folder', 'test-keypair');
    expect((window as any).electron.generateKeyPair).toHaveBeenCalledWith('test-keypair');
    expect(mockKeyPairsService.checkKeysFolderExisting).toHaveBeenCalled();
    expect(mockMessageService.add).toHaveBeenCalledTimes(2);
  });

  it('should handle key pair generation with different names', async () => {
    component.visible = true;
    component.isDifferentKeysNames = true;
    component.publicKeyName = 'public-key';
    component.privateKeyName = 'private-key';

    await component.onGenerateClick();

    expect(component.visible).toBeFalsy();
    expect((window as any).electron.generateKeysWithDifferentNames)
      .toHaveBeenCalledWith('public-key', 'private-key');
    expect(mockKeyPairsService.checkKeysFolderExisting).toHaveBeenCalled();
    expect(mockMessageService.add).toHaveBeenCalledTimes(2);
  });
});
