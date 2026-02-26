import { IsRowPinnedTopPipe } from './is-row-pinned-top.pipe';

describe('IsRowPinnedTopPipe', () => {
  let pipe: IsRowPinnedTopPipe;

  beforeEach(() => {
    pipe = new IsRowPinnedTopPipe();
  });

  it('should return true when row is in pinnedTopRows', () => {
    const row = { id: 1 };
    expect(pipe.transform(row, [row])).toBeTrue();
  });

  it('should return false when row is not in pinnedTopRows', () => {
    const row = { id: 2 };
    expect(pipe.transform(row, [])).toBeFalse();
  });
});
