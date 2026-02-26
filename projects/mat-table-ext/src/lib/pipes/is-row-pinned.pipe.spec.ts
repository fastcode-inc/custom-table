import { IsRowPinnedPipe } from './is-row-pinned.pipe';

describe('IsRowPinnedPipe', () => {
  let pipe: IsRowPinnedPipe;

  beforeEach(() => {
    pipe = new IsRowPinnedPipe();
  });

  it('should return true when row is pinned at top', () => {
    const row = { id: 1 };
    expect(pipe.transform(row, [row], [])).toBeTrue();
  });

  it('should return true when row is pinned at bottom', () => {
    const row = { id: 2 };
    expect(pipe.transform(row, [], [row])).toBeTrue();
  });

  it('should return false when row is not pinned anywhere', () => {
    const row = { id: 3 };
    expect(pipe.transform(row, [], [])).toBeFalse();
  });
});
