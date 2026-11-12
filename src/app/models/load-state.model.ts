/** État d'une donnée chargée de façon asynchrone : il décide de ce que la page affiche. */
export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: T };
