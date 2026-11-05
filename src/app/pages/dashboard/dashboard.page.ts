import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';

import { OLYMPICS_URL } from '../../app.constants';
import { HeaderComponent } from '../../components/header/header.component';
import { PieChartComponent } from '../../components/pie-chart/pie-chart.component';
import { Indicator } from '../../models/indicator.model';
import { Olympic } from '../../models/olympic.model';

interface DashboardView {
  indicators: Indicator[];
  countryIds: number[];
  countries: string[];
  medals: number[];
}

function toDashboardView(olympics: Olympic[]): DashboardView {
  const years = olympics.flatMap((o) => o.participations.map((p) => p.year));
  return {
    indicators: [
      { label: 'Number of countries', value: olympics.length },
      { label: 'Number of JOs', value: new Set(years).size },
    ],
    countryIds: olympics.map((o) => o.id),
    countries: olympics.map((o) => o.country),
    medals: olympics.map((o) => o.participations.reduce((sum, p) => sum + p.medalsCount, 0)),
  };
}

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, HeaderComponent, PieChartComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  readonly view$: Observable<DashboardView>;

  constructor(
    http: HttpClient,
    private readonly router: Router,
  ) {
    this.view$ = http.get<Olympic[]>(OLYMPICS_URL).pipe(map(toDashboardView));
  }

  openCountry(id: number): void {
    this.router.navigate(['/country', id]);
  }
}
