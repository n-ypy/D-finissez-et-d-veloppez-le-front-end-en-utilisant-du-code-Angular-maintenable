import { Component, Input } from '@angular/core';

import { Indicator } from '../../models/indicator.model';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) indicators!: Indicator[];
}

