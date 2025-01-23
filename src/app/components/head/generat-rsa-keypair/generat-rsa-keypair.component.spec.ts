import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratRsaKeypairComponent } from './generat-rsa-keypair.component';

describe('GeneratRsaKeypairComponent', () => {
  let component: GeneratRsaKeypairComponent;
  let fixture: ComponentFixture<GeneratRsaKeypairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneratRsaKeypairComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneratRsaKeypairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
