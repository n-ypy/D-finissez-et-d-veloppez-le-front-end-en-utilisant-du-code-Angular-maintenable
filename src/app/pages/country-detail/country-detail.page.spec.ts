import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { OLYMPICS_URL } from '../../app.constants';
import { Olympic } from '../../models/olympic.model';
import { NotFoundComponent } from '../not-found/not-found.component';
import { CountryDetailPage } from './country-detail.page';

const OLYMPICS: Olympic[] = [{ id: 1, country: 'Italy', participations: [] }];

describe('CountryDetailPage', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  const text = (): string => (harness.routeNativeElement?.textContent ?? '');

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'country/:id', component: CountryDetailPage },
          { path: 'not-found', component: NotFoundComponent },
        ]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  it('redirects an unknown country to /not-found', async () => {
    await harness.navigateByUrl('/country/999');
    http.expectOne(OLYMPICS_URL).flush(OLYMPICS);
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/not-found');
  });

  it('shows an error message and keeps the back button when loading fails', async () => {
    await harness.navigateByUrl('/country/1');
    http.expectOne(OLYMPICS_URL).flush('Server error', { status: 500, statusText: 'Server Error' });
    harness.detectChanges();

    expect(text()).toContain("We couldn't load the data");
    expect(harness.routeNativeElement?.querySelector('a[aria-label="Back to the dashboard"]')).not.toBeNull();
  });

  it('shows "No data available." for a country without participations', async () => {
    await harness.navigateByUrl('/country/1');
    http.expectOne(OLYMPICS_URL).flush(OLYMPICS);
    harness.detectChanges();

    expect(text()).toContain('Italy');
    expect(text()).toContain('No data available.');
  });
});
