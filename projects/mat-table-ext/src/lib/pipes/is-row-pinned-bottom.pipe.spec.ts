import { IsRowPinnedBottomPipe } from './is-row-pinned-bottom.pipe';

describe('IsRowPinnedBottomPipe', () => {
  let pipe: IsRowPinnedBottomPipe;

  beforeEach(() => {
    pipe = new IsRowPinnedBottomPipe();
  });

  it('should return true when row is in pinnedBottomRows', () => {
    const row = { id: 1 };
    expect(pipe.transform(row, [row])).toBeTrue();
  });

  it('should return false when row is not in pinnedBottomRows', () => {
    const row = { id: 2 };
    expect(pipe.transform(row, [])).toBeFalse();
  });
});
