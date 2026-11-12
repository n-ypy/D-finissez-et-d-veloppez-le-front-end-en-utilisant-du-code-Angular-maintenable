import { catchError, map, Observable, of, OperatorFunction, startWith } from 'rxjs';

import { LoadState } from '../models/load-state.model';

/**
 * Transforme un flux de données en flux d'états : `loading` d'abord, puis `ready` avec les données,
 * ou `error` si le flux échoue (requête en échec, données mal formées…).
 * L'erreur est absorbée : la page affiche un message clair, jamais l'erreur technique.
 */
export function withLoadState<T>(): OperatorFunction<T, LoadState<T>> {
  return (source: Observable<T>) =>
    source.pipe(
      map((data): LoadState<T> => ({ status: 'ready', data })),
      startWith<LoadState<T>>({ status: 'loading' }),
      catchError(() => of<LoadState<T>>({ status: 'error' })),
    );
}
