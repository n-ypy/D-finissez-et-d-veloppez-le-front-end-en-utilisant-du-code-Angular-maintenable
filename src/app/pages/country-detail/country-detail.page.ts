import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { filter, map, Observable, switchMap, tap } from 'rxjs';

import { HeaderComponent } from '../../components/header/header.component';
import { LineChartComponent } from '../../components/line-chart/line-chart.component';
import { Indicator } from '../../models/indicator.model';
import { Olympic } from '../../models/olympic.model';
import { DataService } from '../../services/data.service';

interface CountryDetailView {
  country: string;
  indicators: Indicator[];
  years: number[];
  medals: number[];
}

@Component({
  selector: 'app-country-detail',
  imports: [AsyncPipe, HeaderComponent, LineChartComponent, RouterLink],
  templateUrl: './country-detail.page.html',
  styleUrl: './country-detail.page.scss',
})
export class CountryDetailPage {
  readonly view$: Observable<CountryDetailView>;

  constructor(
    route: ActivatedRoute,
    router: Router,
    private readonly dataService: DataService,
  ) {
    this.view$ = route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      switchMap((id) => this.dataService.getOlympicById(id)),
      tap((olympic) => {
        if (!olympic) {
          router.navigate(['/not-found'], { replaceUrl: true });
        }
      }),
      filter((olympic) => olympic !== undefined),
      map((olympic) => this.toView(olympic)),
    );
  }

  private toView(olympic: Olympic): CountryDetailView {
    return {
      country: olympic.country,
      indicators: [
        { label: 'Number of entries', value: olympic.participations.length },
        { label: 'Total number of medals', value: this.dataService.getTotalMedals(olympic) },
        { label: 'Total number of athletes', value: this.dataService.getTotalAthletes(olympic) },
      ],
      years: olympic.participations.map((p) => p.year),
      medals: olympic.participations.map((p) => p.medalsCount),
    };
  }
}

