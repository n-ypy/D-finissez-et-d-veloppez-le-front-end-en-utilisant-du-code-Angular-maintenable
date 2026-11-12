import { firstValueFrom, map, of, throwError, toArray } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { withLoadState } from './with-load-state';

describe('withLoadState', () => {
  it('emits loading, then the data', async () => {
    const states = await firstValueFrom(of(42).pipe(withLoadState(), toArray()));

    expect(states).toEqual([{ status: 'loading' }, { status: 'ready', data: 42 }]);
  });

  it('emits loading, then error when the source fails', async () => {
    const states = await firstValueFrom(
      throwError(() => new Error('HTTP 500')).pipe(withLoadState(), toArray()),
    );

    expect(states).toEqual([{ status: 'loading' }, { status: 'error' }]);
  });

  it('emits error when preparing the data throws', async () => {
    const broken = of(null).pipe(
      map((value) => {
        if (value === null) {
          throw new TypeError('Cannot read properties of null');
        }
        return value;
      }),
    );

    const states = await firstValueFrom(broken.pipe(withLoadState(), toArray()));

    expect(states).toEqual([{ status: 'loading' }, { status: 'error' }]);
  });
});
