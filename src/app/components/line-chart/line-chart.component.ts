import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

import { CHART_COLOR } from '../../app.constants';

// Enregistre seulement ce que ce graphique utilise, au lieu de tout Chart.js (`chart.js/auto`).
// Pas de légende : il n'y a qu'une série.
Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip);

@Component({
  selector: 'app-line-chart',
  imports: [],
  template: '<canvas #canvas role="img" [attr.aria-label]="description"></canvas>',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) labels!: number[];
  @Input({ required: true }) values!: number[];
  /** Unité des valeurs, affichée dans l'infobulle et la description (ex. « medals »). */
  @Input({ required: true }) unit!: string;

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  /** Contenu du graphique en texte, pour les lecteurs d'écran. */
  description = '';

  private chart?: Chart<'line', number[], number>;

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(): void {
    this.description = this.labels
      .map((label, index) => `${label}: ${this.values[index]} ${this.unit}`)
      .join(', ');

    // Au premier passage, le canvas n'existe pas encore : ngAfterViewInit s'en charge.
    if (this.canvas) {
      this.render();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    this.chart?.destroy();
    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [
          {
            label: this.unit,
            data: this.values,
            borderColor: CHART_COLOR,
            backgroundColor: CHART_COLOR,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            backgroundColor: CHART_COLOR,
            displayColors: false,
            callbacks: {
              label: (item) => `${item.formattedValue} ${this.unit}`,
            },
          },
        },
        scales: {
          x: { title: { display: true, text: 'Dates' } },
          // Partir de zéro garde les écarts entre éditions à leur vraie proportion.
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    });
  }
}
