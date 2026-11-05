import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';

import { HeaderComponent } from '../../components/header/header.component';
import { PieChartComponent } from '../../components/pie-chart/pie-chart.component';
import { Indicator } from '../../models/indicator.model';
import { Olympic } from '../../models/olympic.model';
import { DataService } from '../../services/data.service';

interface DashboardView {
  indicators: Indicator[];
  countryIds: number[];
  countries: string[];
  medals: number[];
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
    private readonly dataService: DataService,
    private readonly router: Router,
  ) {
    this.view$ = this.dataService.getOlympics().pipe(map((olympics) => this.toView(olympics)));
  }

  openCountry(id: number): void {
    this.router.navigate(['/country', id]);
  }

  private toView(olympics: Olympic[]): DashboardView {
    return {
      indicators: [
        { label: 'Number of countries', value: olympics.length },
        { label: 'Number of JOs', value: this.dataService.countEditions(olympics) },
      ],
      countryIds: olympics.map((o) => o.id),
      countries: olympics.map((o) => o.country),
      medals: olympics.map((o) => this.dataService.getTotalMedals(o)),
    };
  }
}


