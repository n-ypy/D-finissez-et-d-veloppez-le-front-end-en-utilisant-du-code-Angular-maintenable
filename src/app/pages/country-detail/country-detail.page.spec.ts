import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { CountryDetailPage } from './country-detail.page';

describe('CountryDetailPage', () => {
  let component: CountryDetailPage;
  let fixture: ComponentFixture<CountryDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryDetailPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CountryDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

