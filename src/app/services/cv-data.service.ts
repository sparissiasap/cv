import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { CvData } from '../models/cv-data.model';

@Injectable({ providedIn: 'root' })
export class CvDataService {
  constructor(private http: HttpClient) {}

  loadProfile(profile: string, lang?: string): Observable<CvData> {
    const base = `assets/${profile}/`;
    if (lang) {
      return this.http.get<CvData>(`${base}data.${lang}.json`).pipe(
        catchError(() => this.http.get<CvData>(`${base}data.json`))
      );
    }
    return this.http.get<CvData>(`${base}data.json`);
  }
}
