import { Injectable, inject, DOCUMENT } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CvData } from '../models/cv-data.model';


@Injectable({ providedIn: 'root' })
export class CvDataService {
  private doc = inject(DOCUMENT);

  constructor(private http: HttpClient) {}

  getInlineData(profile: string, lang?: string): CvData | null {
    try {
      const script = this.doc.getElementById('cv-data');
      if (script && script.textContent) {
        const data = JSON.parse(script.textContent) as CvData;
        const profileName = data.profile?.name?.toLowerCase() || '';
        const shareUrl = data.meta?.shareUrl?.toLowerCase() || '';
        const search = profile.toLowerCase();
        
        const profileMatch = profileName.includes(search) || shareUrl.includes('/' + search);
        const langMatch = !lang || data.meta?.lang === lang;
        
        if (profileMatch && langMatch) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Error reading inlined CV data', e);
    }
    return null;
  }

  loadProfile(profile: string, lang?: string): Observable<CvData> {
    const inlineData = this.getInlineData(profile, lang);
    if (inlineData) {
      return of(inlineData);
    }
    const base = `assets/${profile}/`;
    if (lang) {
      return this.http.get<CvData>(`${base}data.${lang}.json`).pipe(
        catchError(() => this.http.get<CvData>(`${base}data.json`))
      );
    }
    return this.http.get<CvData>(`${base}data.json`);
  }
}

