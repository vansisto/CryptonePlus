import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsAppFileTooLargeComponent } from './whats-app-file-too-large.component';

describe('WhatsAppFileTooLargeComponent', () => {
  let component: WhatsAppFileTooLargeComponent;
  let fixture: ComponentFixture<WhatsAppFileTooLargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsAppFileTooLargeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsAppFileTooLargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
