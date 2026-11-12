import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { filter, map, Observable, switchMap, tap } from 'rxjs';

import { HeaderComponent } from '../../components/header/header.component';
import { LineChartComponent } from '../../components/line-chart/line-chart.component';
import { StatusMessageComponent } from '../../components/status-message/status-message.component';
import { Indicator } from '../../models/indicator.model';
import { LoadState } from '../../models/load-state.model';
import { Olympic } from '../../models/olympic.model';
import { DataService } from '../../services/data.service';
import { withLoadState } from '../../utils/with-load-state';

interface CountryDetailView {
  country: string;
  indicators: Indicator[];
  years: number[];
  medals: number[];
  hasParticipations: boolean;
}

@Component({
  selector: 'app-country-detail',
  imports: [AsyncPipe, HeaderComponent, LineChartComponent, RouterLink, StatusMessageComponent],
  templateUrl: './country-detail.page.html',
  styleUrl: './country-detail.page.scss',
})
export class CountryDetailPage {
  readonly state$: Observable<LoadState<CountryDetailView>>;

  constructor(
    route: ActivatedRoute,
    router: Router,
    private readonly dataService: DataService,
  ) {
    this.state$ = route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      // Les erreurs sont traitées dans le switchMap : après une erreur, un changement d'URL recharge encore.
      switchMap((id) =>
        this.dataService.getOlympicById(id).pipe(
          tap((olympic) => {
            if (!olympic) {
              router.navigate(['/not-found'], { replaceUrl: true });
            }
          }),
          filter((olympic) => olympic !== undefined),
          map((olympic) => this.toView(olympic)),
          withLoadState(),
        ),
      ),
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
      hasParticipations: olympic.participations.length > 0,
    };
  }
}

