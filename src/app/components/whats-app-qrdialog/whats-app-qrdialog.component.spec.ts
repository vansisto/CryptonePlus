import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsAppQRDialogComponent } from './whats-app-qrdialog.component';

describe('WhatsAppQRDialogComponent', () => {
  let component: WhatsAppQRDialogComponent;
  let fixture: ComponentFixture<WhatsAppQRDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsAppQRDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsAppQRDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
