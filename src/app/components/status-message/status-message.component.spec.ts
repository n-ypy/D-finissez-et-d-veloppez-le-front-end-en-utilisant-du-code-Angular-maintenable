import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { StatusMessageComponent } from './status-message.component';

@Component({
  imports: [StatusMessageComponent],
  template: '<app-status-message type="error"><button type="button">Try again</button></app-status-message>',
})
class HostComponent {}

describe('StatusMessageComponent', () => {
  function render(type: 'loading' | 'empty' | 'error'): HTMLElement {
    const fixture = TestBed.createComponent(StatusMessageComponent);
    fixture.componentRef.setInput('type', type);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows a spinner and a polite status while loading', () => {
    const element = render('loading');

    expect(element.querySelector('.spinner')).not.toBeNull();
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Loading data');
  });

  it('shows "No data available." when empty', () => {
    expect(render('empty').textContent).toContain('No data available.');
  });

  it('shows a non-technical alert on error', () => {
    const alert = render('error').querySelector('[role="alert"]');

    expect(alert?.textContent).toContain("We couldn't load the data");
  });

  it('displays the actions given by the page', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"] button')?.textContent).toBe(
      'Try again',
    );
  });
});
