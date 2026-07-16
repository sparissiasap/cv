import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { CvDataService } from './cv-data.service';
import { CvData } from '../models/cv-data.model';

const mockData = { meta: { lang: 'es' } } as CvData;

describe('CvDataService', () => {
  let service: CvDataService;
  let httpGet: jest.Mock;

  beforeEach(() => {
    httpGet = jest.fn();
    service = new CvDataService({ get: httpGet } as unknown as HttpClient);
  });

  it('sin lang → carga data.json', done => {
    httpGet.mockReturnValue(of(mockData));
    service.loadProfile('Sergio').subscribe(data => {
      expect(httpGet).toHaveBeenCalledWith('assets/Sergio/data.json');
      expect(data).toEqual(mockData);
      done();
    });
  });

  it('con lang → carga data.<lang>.json', done => {
    httpGet.mockReturnValue(of(mockData));
    service.loadProfile('Sergio', 'en').subscribe(data => {
      expect(httpGet).toHaveBeenCalledWith('assets/Sergio/data.en.json');
      done();
    });
  });

  it('con lang y 404 → fallback a data.json', done => {
    httpGet
      .mockReturnValueOnce(throwError(() => new Error('404')))
      .mockReturnValueOnce(of(mockData));
    service.loadProfile('Sergio', 'en').subscribe(data => {
      expect(httpGet).toHaveBeenCalledTimes(2);
      expect(httpGet).toHaveBeenNthCalledWith(1, 'assets/Sergio/data.en.json');
      expect(httpGet).toHaveBeenNthCalledWith(2, 'assets/Sergio/data.json');
      done();
    });
  });
});
