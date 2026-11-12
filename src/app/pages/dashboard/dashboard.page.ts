import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';

import { HeaderComponent } from '../../components/header/header.component';
import { PieChartComponent } from '../../components/pie-chart/pie-chart.component';
import { StatusMessageComponent } from '../../components/status-message/status-message.component';
import { Indicator } from '../../models/indicator.model';
import { LoadState } from '../../models/load-state.model';
import { Olympic } from '../../models/olympic.model';
import { PieSlice } from '../../models/pie-slice.model';
import { DataService } from '../../services/data.service';
import { withLoadState } from '../../utils/with-load-state';

interface DashboardView {
  indicators: Indicator[];
  slices: PieSlice[];
  hasData: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, HeaderComponent, PieChartComponent, StatusMessageComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  readonly state$: Observable<LoadState<DashboardView>>;

  /** Chaque émission relance le chargement (bouton « Try again »). */
  private readonly reload$ = new BehaviorSubject<void>(undefined);

  constructor(
    private readonly dataService: DataService,
    private readonly router: Router,
  ) {
    this.state$ = this.reload$.pipe(
      switchMap(() =>
        this.dataService.getOlympics().pipe(
          map((olympics) => this.toView(olympics)),
          withLoadState(),
        ),
      ),
    );
  }

  openCountry(id: number): void {
    this.router.navigate(['/country', id]);
  }

  retry(): void {
    this.reload$.next();
  }

  private toView(olympics: Olympic[]): DashboardView {
    return {
      indicators: [
        { label: 'Number of JOs', value: this.dataService.countEditions(olympics) },
        { label: 'Number of countries', value: olympics.length },
      ],
      slices: olympics.map((o) => ({
        id: o.id,
        label: o.country,
        value: this.dataService.getTotalMedals(o),
      })),
      hasData: olympics.length > 0,
    };
  }
}
