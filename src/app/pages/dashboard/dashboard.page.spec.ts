import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { OLYMPICS_URL } from '../../app.constants';
import { DashboardPage } from './dashboard.page';

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let http: HttpTestingController;

  const text = (): string => (fixture.nativeElement as HTMLElement).textContent ?? '';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
  });

  it('shows a loading message until the data arrives', () => {
    expect(text()).toContain('Loading data');
  });

  it('shows an error message, then loads again with "Try again"', () => {
    http.expectOne(OLYMPICS_URL).flush('Server error', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(text()).toContain("We couldn't load the data");
    expect(text()).not.toContain('500');

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[role="alert"] button')?.click();
    fixture.detectChanges();
    http.expectOne(OLYMPICS_URL).flush([]);
    fixture.detectChanges();

    expect(text()).toContain('Medals per Country');
  });

  it('shows "No data available." when there is no country', () => {
    http.expectOne(OLYMPICS_URL).flush([]);
    fixture.detectChanges();

    expect(text()).toContain('Medals per Country');
    expect(text()).toContain('No data available.');
  });
});
