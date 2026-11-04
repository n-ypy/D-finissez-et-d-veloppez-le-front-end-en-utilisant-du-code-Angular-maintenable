import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import Chart from 'chart.js/auto';

import { CHART_COLOR } from '../../app.constants';

@Component({
  selector: 'app-line-chart',
  imports: [],
  template: '<canvas #canvas></canvas>',
  // La taille vient du CSS : Chart.js ne fait que remplir ce cadre.
  styles: ':host { display: block; position: relative; aspect-ratio: 2.5; min-height: 0; }',
})
export class LineChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) labels!: number[];
  @Input({ required: true }) values!: number[];

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart<'line', number[], number>;

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(): void {
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
            label: 'Medals',
            data: this.values,
            backgroundColor: CHART_COLOR,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: 'Date' } },
        },
      },
    });
  }
}
