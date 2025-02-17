import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    localStorageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem']);
    spyOn(localStorage, 'getItem').and.callFake(localStorageSpy.getItem);
    spyOn(localStorage, 'setItem').and.callFake(localStorageSpy.setItem);

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });

    service = TestBed.inject(ThemeService);

    document.body.classList.remove('dark-theme', 'light-theme');
  });

  afterEach(() => {
    document.body.classList.remove('dark-theme', 'light-theme');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Toggle Theme', () => {
    it('should toggle from light to dark theme', () => {
      document.body.classList.add('light-theme');

      service.toggleTheme();

      expect(document.body.classList.contains('dark-theme')).toBeTrue();
      expect(document.body.classList.contains('light-theme')).toBeFalse();
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark-theme');
    });

    it('should toggle from dark to light theme', () => {
      document.body.classList.add('dark-theme');

      service.toggleTheme();
      service.toggleTheme();

      expect(document.body.classList.contains('light-theme')).toBeTrue();
      expect(document.body.classList.contains('dark-theme')).toBeFalse();
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light-theme');
    });

    it('should remove old theme class when toggling', () => {
      document.body.classList.add('light-theme', 'dark-theme');

      service.toggleTheme();

      const hasOnlyOneTheme =
        (document.body.classList.contains('dark-theme') && !document.body.classList.contains('light-theme')) ||
        (document.body.classList.contains('light-theme') && !document.body.classList.contains('dark-theme'));

      expect(hasOnlyOneTheme).toBeTrue();
    });
  });

  describe('Load Theme', () => {
    it('should load light theme by default when no theme is saved', () => {
      localStorageSpy.getItem.and.returnValue(null);

      service.loadTheme();

      expect(document.body.classList.contains('light-theme')).toBeTrue();
      expect(document.body.classList.contains('dark-theme')).toBeFalse();
    });

    it('should load saved dark theme from localStorage', () => {
      localStorageSpy.getItem.and.returnValue('dark-theme');

      service.loadTheme();

      expect(document.body.classList.contains('dark-theme')).toBeTrue();
      expect(document.body.classList.contains('light-theme')).toBeFalse();
    });

    it('should load saved light theme from localStorage', () => {
      localStorageSpy.getItem.and.returnValue('light-theme');

      service.loadTheme();

      expect(document.body.classList.contains('light-theme')).toBeTrue();
      expect(document.body.classList.contains('dark-theme')).toBeFalse();
    });

    it('should set isDarkTheme correctly when loading theme', () => {
      localStorageSpy.getItem.and.returnValue('dark-theme');
      service.loadTheme();

      service.toggleTheme();

      expect(document.body.classList.contains('light-theme')).toBeTrue();
      expect(document.body.classList.contains('dark-theme')).toBeFalse();
    });
  });

  describe('Theme Persistence', () => {
    it('should save theme preference to localStorage when toggling', () => {
      service.toggleTheme();
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark-theme');

      service.toggleTheme();
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light-theme');
    });

    it('should read theme preference from localStorage when loading', () => {
      service.loadTheme();
      expect(localStorage.getItem).toHaveBeenCalledWith('theme');
    });
  });
});
