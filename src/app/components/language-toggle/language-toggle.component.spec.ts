import { Router, ActivatedRoute } from '@angular/router';
import { LanguageToggleComponent } from './language-toggle.component';

describe('LanguageToggleComponent', () => {
  let component: LanguageToggleComponent;
  let navigateSpy: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    navigateSpy = jest.fn();
    const router = { navigate: navigateSpy } as unknown as Router;
    const route = {} as ActivatedRoute;
    component = new LanguageToggleComponent(router, route);
  });

  afterEach(() => jest.useRealTimers());

  it('switchLang("en") → navega con { lang: "en" } tras 210ms', () => {
    component.switchLang('en');
    expect(navigateSpy).not.toHaveBeenCalled();
    jest.advanceTimersByTime(210);
    expect(navigateSpy).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { lang: 'en' },
      queryParamsHandling: 'merge',
    });
  });

  it('switchLang("es") → navega con { lang: "es" }', () => {
    component.switchLang('es');
    jest.advanceTimersByTime(210);
    expect(navigateSpy).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { lang: 'es' } }));
  });
});
