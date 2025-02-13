import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecryptDialogComponent } from './decrypt-dialog.component';

describe('DecryptDialogComponent', () => {
  let component: DecryptDialogComponent;
  let fixture: ComponentFixture<DecryptDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecryptDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecryptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
