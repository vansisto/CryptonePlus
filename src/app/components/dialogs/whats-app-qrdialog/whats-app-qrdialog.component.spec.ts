import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhatsAppQRDialogComponent } from './whats-app-qrdialog.component';

describe('WhatsAppQRDialogComponent', () => {
  let component: WhatsAppQRDialogComponent;
  let fixture: ComponentFixture<WhatsAppQRDialogComponent>;

  beforeEach(async () => {
    (window as any).electron = {
      receive: jasmine.createSpy('receive'),
    };

    await TestBed.configureTestingModule({
      imports: [WhatsAppQRDialogComponent]
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

  it('should handle whatsapp-qr-received event', () => {
    const receiveCall = ((window as any).electron.receive as jasmine.Spy).calls.allArgs()
        .find(call => call[0] === 'whatsapp-qr-received');

    expect(receiveCall).toBeDefined();
    if (!receiveCall) return;

    const qrCallback = receiveCall[1];

    qrCallback('test-qr-data');

    expect(component.whatsAppQR).toBe('test-qr-data');
    expect(component.isWhatsAppQrDialogVisible).toBe(true);
  });

  it('should handle whatsapp-authenticated event', () => {
    const authCall = ((window as any).electron.receive as jasmine.Spy).calls.allArgs()
        .find(call => call[0] === 'whatsapp-authenticated');

    expect(authCall).toBeDefined();
    if (!authCall) return;

    const authCallback = authCall[1];

    authCallback();

    expect(component.isWhatsAppQrDialogVisible).toBe(false);
  });
});
