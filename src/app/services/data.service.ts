import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';

import { OLYMPICS_URL } from '../app.constants';
import { Olympic } from '../models/olympic.model';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly olympics$: Observable<Olympic[]>;

  constructor(http: HttpClient) {
    this.olympics$ = http.get<Olympic[]>(OLYMPICS_URL).pipe(shareReplay(1));
  }

  getOlympics(): Observable<Olympic[]> {
    return this.olympics$;
  }

  /** Renvoie le pays demandé, ou `undefined` s'il n'existe pas. */
  getOlympicById(id: number): Observable<Olympic | undefined> {
    return this.olympics$.pipe(map((olympics) => olympics.find((o) => o.id === id)));
  }

  getTotalMedals(olympic: Olympic): number {
    return olympic.participations.reduce((sum, p) => sum + p.medalsCount, 0);
  }

  getTotalAthletes(olympic: Olympic): number {
    return olympic.participations.reduce((sum, p) => sum + p.athleteCount, 0);
  }

  /** Compte chaque édition une seule fois : plusieurs pays participent à la même année. */
  countEditions(olympics: Olympic[]): number {
    const years = olympics.flatMap((o) => o.participations.map((p) => p.year));
    return new Set(years).size;
  }
}

