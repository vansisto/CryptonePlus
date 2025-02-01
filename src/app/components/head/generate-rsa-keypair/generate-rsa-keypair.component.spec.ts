import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateRsaKeypairComponent } from './generate-rsa-keypair.component';

describe('GeneratRsaKeypairComponent', () => {
  let component: GenerateRsaKeypairComponent;
  let fixture: ComponentFixture<GenerateRsaKeypairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateRsaKeypairComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateRsaKeypairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
