import { TestBed } from '@angular/core/testing';
import { DialogService } from './dialog.service';
import { firstValueFrom } from 'rxjs';

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DialogService]
    });
    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Encrypt Dialog', () => {
    it('should initially be hidden', async () => {
      const isVisible = await firstValueFrom(service.encryptDialogVisible$);
      expect(isVisible).toBeFalse();
    });

    it('should show encrypt dialog', async () => {
      service.showEncryptDialog();
      const isVisible = await firstValueFrom(service.encryptDialogVisible$);
      expect(isVisible).toBeTrue();
    });

    it('should hide encrypt dialog', async () => {
      service.showEncryptDialog();
      service.hideEncryptDialog();
      const isVisible = await firstValueFrom(service.encryptDialogVisible$);
      expect(isVisible).toBeFalse();
    });
  });

  describe('Decrypt Dialog', () => {
    it('should initially be hidden', async () => {
      const isVisible = await firstValueFrom(service.decryptDialogVisible$);
      expect(isVisible).toBeFalse();
    });

    it('should show decrypt dialog', async () => {
      service.showDecryptDialog();
      const isVisible = await firstValueFrom(service.decryptDialogVisible$);
      expect(isVisible).toBeTrue();
    });

    it('should hide decrypt dialog', async () => {
      service.showDecryptDialog();
      service.hideDecryptDialog();
      const isVisible = await firstValueFrom(service.decryptDialogVisible$);
      expect(isVisible).toBeFalse();
    });
  });

  describe('WhatsApp Contact List Dialog', () => {
    it('should initially be hidden', async () => {
      const isVisible = await firstValueFrom(service.whatsAppContactListDialogVisible$);
      expect(isVisible).toBeFalse();
    });

    it('should show WhatsApp contact list dialog', async () => {
      service.showWhatsAppContactListDialog();
      const isVisible = await firstValueFrom(service.whatsAppContactListDialogVisible$);
      expect(isVisible).toBeTrue();
    });

    it('should hide WhatsApp contact list dialog', async () => {
      service.showWhatsAppContactListDialog();
      service.hideWhatsAppContactListDialog();
      const isVisible = await firstValueFrom(service.whatsAppContactListDialogVisible$);
      expect(isVisible).toBeFalse();
    });

    it('should return correct visibility state', () => {
      service.showWhatsAppContactListDialog();
      expect(service.isWhatsAppContactListDialogVisible()).toBeTrue();

      service.hideWhatsAppContactListDialog();
      expect(service.isWhatsAppContactListDialogVisible()).toBeFalse();
    });
  });

  describe('WhatsApp File Too Large Dialog', () => {
    it('should initially be hidden', async () => {
      const isVisible = await firstValueFrom(service.whatsAppFileTooLargeDialogVisible$);
      expect(isVisible).toBeFalse();
    });

    it('should show WhatsApp file too large dialog', async () => {
      service.showWhatsAppFileTooLargeDialog();
      const isVisible = await firstValueFrom(service.whatsAppFileTooLargeDialogVisible$);
      expect(isVisible).toBeTrue();
    });
  });

  describe('Multiple Dialogs Interaction', () => {
    it('should handle multiple dialogs independently', async () => {
      service.showEncryptDialog();
      service.showDecryptDialog();

      const encryptVisible = await firstValueFrom(service.encryptDialogVisible$);
      const decryptVisible = await firstValueFrom(service.decryptDialogVisible$);

      expect(encryptVisible).toBeTrue();
      expect(decryptVisible).toBeTrue();

      service.hideEncryptDialog();

      const encryptVisibleAfterHide = await firstValueFrom(service.encryptDialogVisible$);
      const decryptVisibleAfterHide = await firstValueFrom(service.decryptDialogVisible$);

      expect(encryptVisibleAfterHide).toBeFalse();
      expect(decryptVisibleAfterHide).toBeTrue();
    });
  });

  describe('Observable Behavior', () => {
    it('should emit new values to subscribers', (done) => {
      const values: boolean[] = [];

      service.encryptDialogVisible$.subscribe(value => {
        values.push(value);
        if (values.length === 3) {
          expect(values).toEqual([false, true, false]);
          done();
        }
      });

      service.showEncryptDialog();
      service.hideEncryptDialog();
    });
  });
});
