import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsAppContactListDialogComponent } from './whats-app-contact-list-dialog.component';

describe('WhatsAppContactListDialogComponent', () => {
  let component: WhatsAppContactListDialogComponent;
  let fixture: ComponentFixture<WhatsAppContactListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsAppContactListDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsAppContactListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
