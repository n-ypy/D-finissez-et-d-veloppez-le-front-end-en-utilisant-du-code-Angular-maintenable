import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import Chart from 'chart.js/auto';

import { CHART_COLOR, PIE_COLORS } from '../../app.constants';
import { PieSlice } from '../../models/pie-slice.model';

interface LegendItem extends PieSlice {
  color: string;
}

@Component({
  selector: 'app-pie-chart',
  imports: [],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss',
})
export class PieChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) slices!: PieSlice[];
  /** Unité des valeurs, affichée dans l'infobulle, la légende et la description (ex. « medals »). */
  @Input({ required: true }) unit!: string;

  /** Émet l'id de la part choisie, sur le graphique ou dans la légende. */
  @Output() sliceClick = new EventEmitter<number>();

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  legend: LegendItem[] = [];
  /** Contenu du graphique en texte, pour les lecteurs d'écran. */
  description = '';

  private chart?: Chart<'pie', number[], string>;

  ngOnChanges(): void {
    this.legend = this.slices.map((slice, index) => ({
      ...slice,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }));
    this.description = this.legend.map((item) => `${item.label}: ${item.value} ${this.unit}`).join(', ');

    // Au premier passage, le canvas n'existe pas encore : ngAfterViewInit s'en charge.
    if (this.canvas) {
      this.render();
    }
  }

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    this.chart?.destroy();
    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'pie',
      data: {
        labels: this.legend.map((item) => item.label),
        datasets: [
          {
            label: this.unit,
            data: this.legend.map((item) => item.value),
            backgroundColor: this.legend.map((item) => item.color),
            hoverOffset: 8,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          // La légende est en HTML (voir le template) pour être cliquable au clavier.
          legend: { display: false },
          tooltip: {
            backgroundColor: CHART_COLOR,
            displayColors: false,
            callbacks: {
              title: (items) => items[0]?.label ?? '',
              label: (item) => `${item.formattedValue} ${this.unit}`,
            },
          },
        },
        onClick: (_event, elements) => {
          if (elements.length > 0) {
            this.sliceClick.emit(this.legend[elements[0].index].id);
          }
        },
        onHover: (_event, elements) => {
          this.canvas.nativeElement.style.cursor = elements.length > 0 ? 'pointer' : 'default';
        },
      },
    });
  }
}
