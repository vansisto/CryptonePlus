import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhatsAppQRDialogComponent } from './whats-app-qrdialog.component';
import { Dialog } from 'primeng/dialog';
import { QRCodeComponent } from 'angularx-qrcode';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('WhatsAppQRDialogComponent', () => {
  let component: WhatsAppQRDialogComponent;
  let fixture: ComponentFixture<WhatsAppQRDialogComponent>;
  const testQrData = 'test-qr-data';

  beforeEach(async () => {
    (window as any).electron = {
      receive: jasmine.createSpy('receive'),
    };

    await TestBed.configureTestingModule({
      imports: [
        WhatsAppQRDialogComponent,
        NoopAnimationsModule,
        Dialog,
        QRCodeComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WhatsAppQRDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as any).electron;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.whatsAppQR).toBe('');
    expect(component.isWhatsAppQrDialogVisible).toBeFalse();
  });

  describe('electron events', () => {
    it('should register electron event listeners on init', () => {
      expect((window as any).electron.receive).toHaveBeenCalledWith('whatsapp-qr-received', jasmine.any(Function));
      expect((window as any).electron.receive).toHaveBeenCalledWith('whatsapp-authenticated', jasmine.any(Function));
    });

    it('should handle whatsapp-qr-received event', () => {
      const receiveCall = ((window as any).electron.receive as jasmine.Spy).calls.allArgs()
        .find(call => call[0] === 'whatsapp-qr-received');
      expect(receiveCall).toBeDefined();

      if (receiveCall) {
        const qrCallback = receiveCall[1];
        qrCallback(testQrData);

        expect(component.whatsAppQR).toBe(testQrData);
        expect(component.isWhatsAppQrDialogVisible).toBeTrue();
      }
    });

    it('should handle whatsapp-authenticated event', () => {
      component.isWhatsAppQrDialogVisible = true;

      const authCall = ((window as any).electron.receive as jasmine.Spy).calls.allArgs()
        .find(call => call[0] === 'whatsapp-authenticated');
      expect(authCall).toBeDefined();

      if (authCall) {
        const authCallback = authCall[1];
        authCallback();

        expect(component.isWhatsAppQrDialogVisible).toBeFalse();
      }
    });
  });

  describe('UI elements', () => {
    it('should show dialog when isWhatsAppQrDialogVisible is true', () => {
      component.isWhatsAppQrDialogVisible = true;
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('p-dialog');
      expect(dialog).toBeTruthy();
    });

    it('should render QR code component with correct data', () => {
      component.whatsAppQR = testQrData;
      component.isWhatsAppQrDialogVisible = true;
      fixture.detectChanges();

      const qrCode = fixture.nativeElement.querySelector('qrcode');
      expect(qrCode).toBeTruthy();
      expect(qrCode.getAttribute('ng-reflect-qrdata')).toBe(testQrData);
      expect(qrCode.getAttribute('ng-reflect-width')).toBe('270');
      expect(qrCode.getAttribute('ng-reflect-error-correction-level')).toBe('M');
      expect(qrCode.getAttribute('ng-reflect-allow-empty-string')).toBe('true');
    });
  });
});
