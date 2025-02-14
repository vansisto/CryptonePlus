import { CFile } from './cfile';

describe('CFile', () => {
  it('should create an instance', () => {
    expect(new CFile("test", "test", true, 12)).toBeTruthy();
  });
});
