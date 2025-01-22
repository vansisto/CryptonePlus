import { CFile } from './cfile';

describe('CFile', () => {
  it('should create an instance', () => {
    expect(new CFile("test", "test", "test", "test")).toBeTruthy();
  });
});
