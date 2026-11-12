import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { OLYMPICS_URL } from '../app.constants';
import { Olympic } from '../models/olympic.model';
import { DataService } from './data.service';

const OLYMPICS: Olympic[] = [
  {
    id: 1,
    country: 'Italy',
    participations: [
      { id: 1, year: 2012, city: 'Londres', medalsCount: 28, athleteCount: 372 },
      { id: 2, year: 2016, city: 'Rio de Janeiro', medalsCount: 28, athleteCount: 375 },
    ],
  },
  {
    id: 2,
    country: 'Spain',
    participations: [{ id: 1, year: 2016, city: 'Rio de Janeiro', medalsCount: 17, athleteCount: 315 }],
  },
];

describe('DataService', () => {
  let service: DataService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('computes the totals of a country', () => {
    expect(service.getTotalMedals(OLYMPICS[0])).toBe(56);
    expect(service.getTotalAthletes(OLYMPICS[0])).toBe(747);
  });

  it('counts each edition once', () => {
    expect(service.countEditions(OLYMPICS)).toBe(2);
  });

  it('finds a country by id, or returns undefined', async () => {
    const spain = firstValueFrom(service.getOlympicById(2));
    http.expectOne(OLYMPICS_URL).flush(OLYMPICS);
    expect(await spain).toEqual(OLYMPICS[1]);

    expect(await firstValueFrom(service.getOlympicById(99))).toBeUndefined();
  });

  it('loads the file only once', async () => {
    const first = firstValueFrom(service.getOlympics());
    const second = firstValueFrom(service.getOlympics());
    http.expectOne(OLYMPICS_URL).flush(OLYMPICS);

    expect(await first).toEqual(OLYMPICS);
    expect(await second).toEqual(OLYMPICS);
  });

  it('requests the file again after a failure', async () => {
    const failed = firstValueFrom(service.getOlympics());
    http.expectOne(OLYMPICS_URL).flush('Server error', { status: 500, statusText: 'Server Error' });
    await expect(failed).rejects.toBeTruthy();

    const retried = firstValueFrom(service.getOlympics());
    http.expectOne(OLYMPICS_URL).flush(OLYMPICS);
    expect(await retried).toEqual(OLYMPICS);
  });
});
