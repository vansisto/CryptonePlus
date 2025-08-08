import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from './services/theme.service';
import { LoadingService } from './services/loading.service';
import { BehaviorSubject } from 'rxjs';
import { Component } from '@angular/core';

@Component({
  selector: 'app-head',
  template: ''
})
class MockHeadComponent {}

@Component({selector: 'app-files-table', template: ''}) class MockFilesTableComponent {}
@Component({selector: 'app-control', template: ''}) class MockControlComponent {}
@Component({selector: 'app-encrypt-dialog', template: ''}) class MockEncryptDialogComponent {}
@Component({selector: 'app-decrypt-dialog', template: ''}) class MockDecryptDialogComponent {}

describe('AppComponent', () => {
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;

  beforeEach(async () => {
    (window as any).electron = {
      setZoom: jasmine.createSpy('setZoom'),
      receive: jasmine.createSpy('receive')
    };

    mockThemeService = jasmine.createSpyObj('ThemeService', ['loadTheme'], {
      isDarkTheme: false
    });

    mockLoadingService = jasmine.createSpyObj('LoadingService', [], {
      loading$: new BehaviorSubject<boolean>(false)
    });

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        { provide: LoadingService, useValue: mockLoadingService }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    delete (window as any).electron;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'Cryptone' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Cryptone');
  });
});
