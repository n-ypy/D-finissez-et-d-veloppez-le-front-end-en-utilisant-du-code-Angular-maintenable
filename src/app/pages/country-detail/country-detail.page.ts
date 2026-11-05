import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { filter, map, Observable, switchMap, tap } from 'rxjs';

import { OLYMPICS_URL } from '../../app.constants';
import { HeaderComponent } from '../../components/header/header.component';
import { LineChartComponent } from '../../components/line-chart/line-chart.component';
import { Indicator } from '../../models/indicator.model';
import { Olympic } from '../../models/olympic.model';

interface CountryDetailView {
  country: string;
  indicators: Indicator[];
  years: number[];
  medals: number[];
}

function toCountryDetailView(olympic: Olympic): CountryDetailView {
  const { participations } = olympic;
  return {
    country: olympic.country,
    indicators: [
      { label: 'Number of entries', value: participations.length },
      {
        label: 'Total Number of medals',
        value: participations.reduce((sum, p) => sum + p.medalsCount, 0),
      },
      {
        label: 'Total Number of athletes',
        value: participations.reduce((sum, p) => sum + p.athleteCount, 0),
      },
    ],
    years: participations.map((p) => p.year),
    medals: participations.map((p) => p.medalsCount),
  };
}

@Component({
  selector: 'app-country-detail',
  imports: [AsyncPipe, HeaderComponent, LineChartComponent, RouterLink],
  templateUrl: './country-detail.page.html',
  styleUrl: './country-detail.page.scss',
})
export class CountryDetailPage {
  readonly view$: Observable<CountryDetailView>;

  constructor(route: ActivatedRoute, http: HttpClient, router: Router) {
    this.view$ = route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      switchMap((id) =>
        http.get<Olympic[]>(OLYMPICS_URL).pipe(map((olympics) => olympics.find((o) => o.id === id))),
      ),
      tap((olympic) => {
        if (!olympic) {
          router.navigate(['/not-found'], { replaceUrl: true });
        }
      }),
      filter((olympic) => olympic !== undefined),
      map(toCountryDetailView),
    );
  }
}

