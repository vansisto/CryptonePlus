import { TestBed } from '@angular/core/testing';
import { KeyPairsService } from './key-pairs.service';
import { firstValueFrom } from 'rxjs';

describe('KeyPairsService', () => {
  let service: KeyPairsService;
  let mockElectron: any;

  beforeEach(() => {
    mockElectron = {
      isKeysFolderExists: jasmine.createSpy('isKeysFolderExists')
    };

    (window as any).electron = mockElectron;

    TestBed.configureTestingModule({
      providers: [KeyPairsService]
    });

    service = TestBed.inject(KeyPairsService);
  });

  afterEach(() => {
    delete (window as any).electron;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize isKeysFolderExists$ with false', async () => {
      const initialValue = await firstValueFrom(service.isKeysFolderExists$);
      expect(initialValue).toBeFalse();
    });

    it('should have electron property initialized', () => {
      expect(service.electron).toBeDefined();
      expect(service.electron.isKeysFolderExists).toBeDefined();
    });
  });

  describe('Check Keys Folder', () => {
    it('should update isKeysFolderExists when folder exists', async () => {
      mockElectron.isKeysFolderExists.and.returnValue(Promise.resolve(true));

      service.checkKeysFolderExisting();
      await mockElectron.isKeysFolderExists();

      const exists = await firstValueFrom(service.isKeysFolderExists$);
      expect(exists).toBeTrue();
      expect(mockElectron.isKeysFolderExists).toHaveBeenCalled();
    });

    it('should update isKeysFolderExists when folder does not exist', async () => {
      mockElectron.isKeysFolderExists.and.returnValue(Promise.resolve(false));

      service.checkKeysFolderExisting();
      await mockElectron.isKeysFolderExists();

      const exists = await firstValueFrom(service.isKeysFolderExists$);
      expect(exists).toBeFalse();
      expect(mockElectron.isKeysFolderExists).toHaveBeenCalled();
    });

    it('should handle errors from electron API', async () => {
      mockElectron.isKeysFolderExists.and.returnValue(Promise.reject(new Error('Failed to check')));

      service.checkKeysFolderExisting();
      try {
        await mockElectron.isKeysFolderExists();
      } catch (error) {
        const exists = await firstValueFrom(service.isKeysFolderExists$);
        expect(exists).toBeFalse();
      }
      expect(mockElectron.isKeysFolderExists).toHaveBeenCalled();
    });
  });

  describe('Behavior Subject', () => {
    it('should emit new values to subscribers', (done) => {
      mockElectron.isKeysFolderExists.and.returnValue(Promise.resolve(true));

      const values: boolean[] = [];
      service.isKeysFolderExists$.subscribe(value => {
        values.push(value);
        if (values.length === 2) {
          expect(values).toEqual([false, true]);
          done();
        }
      });

      service.checkKeysFolderExisting();
    });
  });
});
