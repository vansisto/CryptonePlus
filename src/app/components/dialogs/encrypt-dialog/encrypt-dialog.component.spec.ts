import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncryptDialogComponent } from './encrypt-dialog.component';

describe('EncryptDialogComponent', () => {
  let component: EncryptDialogComponent;
  let fixture: ComponentFixture<EncryptDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncryptDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncryptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
