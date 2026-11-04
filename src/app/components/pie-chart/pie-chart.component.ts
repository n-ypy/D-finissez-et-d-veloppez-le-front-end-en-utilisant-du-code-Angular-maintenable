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

import { PIE_COLORS } from '../../app.constants';

@Component({
  selector: 'app-pie-chart',
  imports: [],
  template: '<canvas #canvas></canvas>',
  styles: ':host { display: block; position: relative; aspect-ratio: 2.5; min-height: 0; }',
})
export class PieChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) labels!: string[];
  @Input({ required: true }) values!: number[];

  @Output() sliceClick = new EventEmitter<number>();

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart<'pie', number[], string>;

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
      type: 'pie',
      data: {
        labels: this.labels,
        datasets: [
          {
            label: 'Medals',
            data: this.values,
            backgroundColor: PIE_COLORS,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        onClick: (_event, elements) => {
          if (elements.length > 0) {
            this.sliceClick.emit(elements[0].index);
          }
        },
      },
    });
  }
}

