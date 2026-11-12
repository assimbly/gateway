import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TranslateService, provideTranslateService } from '@ngx-translate/core';

import TranslateDirective from './translate.directive';

@Component({
  imports: [TranslateDirective],
  template: `<div jhiTranslate="delete.question" [translateValues]="{ login }"></div>`,
})
class TestTranslateDirective {
  login = '<img src="x" onerror="alert(1)"><script>alert(2)</script>';
}

describe('TranslateDirective sanitizing', () => {
  it('keeps the markup of a translation, without the scripts a value brings in', () => {
    TestBed.configureTestingModule({ providers: [provideTranslateService()] });
    const translateService = TestBed.inject(TranslateService);
    translateService.setTranslation('en', { 'delete.question': 'Delete <b>{{ login }}</b>?' });
    translateService.use('en');

    const fixture = TestBed.createComponent(TestTranslateDirective);
    fixture.detectChanges();

    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(div.querySelector('b')).not.toBeNull();
    expect(div.querySelector('script')).toBeNull();
    expect(div.innerHTML).not.toContain('onerror');
  });
});
