import { GetRowPinPositionPipe } from './get-row-pin-position.pipe';

describe('GetRowPinPositionPipe', () => {
  let pipe: GetRowPinPositionPipe;

  beforeEach(() => {
    pipe = new GetRowPinPositionPipe();
  });

  it('should return top when row exists in pinnedTopRows', () => {
    const row = { id: 1 };
    expect(pipe.transform(row, [row], [])).toBe('top');
  });

  it('should return bottom when row exists in pinnedBottomRows only', () => {
    const row = { id: 2 };
    expect(pipe.transform(row, [], [row])).toBe('bottom');
  });

  it('should return null when row is not pinned', () => {
    const row = { id: 3 };
    expect(pipe.transform(row, [], [])).toBeNull();
  });
});
