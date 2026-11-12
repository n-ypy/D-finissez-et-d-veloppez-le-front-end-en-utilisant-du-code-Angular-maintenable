import { Component, Input } from '@angular/core';

export type StatusType = 'loading' | 'empty' | 'error';

const MESSAGES: Record<StatusType, string> = {
  loading: 'Loading data…',
  empty: 'No data available.',
  error: "We couldn't load the data. Please try again later.",
};

/** Message affiché à la place du contenu : chargement, données vides ou erreur. */
@Component({
  selector: 'app-status-message',
  imports: [],
  templateUrl: './status-message.component.html',
  styleUrl: './status-message.component.scss',
})
export class StatusMessageComponent {
  @Input({ required: true }) type!: StatusType;

  get message(): string {
    return MESSAGES[this.type];
  }

  /** Une erreur est annoncée tout de suite par les lecteurs d'écran, les autres états poliment. */
  get role(): 'alert' | 'status' {
    return this.type === 'error' ? 'alert' : 'status';
  }
}
