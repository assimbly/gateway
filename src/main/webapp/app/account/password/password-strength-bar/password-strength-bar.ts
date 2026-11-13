import { Component, computed, input } from '@angular/core';

import { TranslateDirective } from 'app/shared/language';

@Component({
  selector: 'jhi-password-strength-bar',
  imports: [TranslateDirective],
  templateUrl: './password-strength-bar.html',
  styleUrl: './password-strength-bar.scss',
})
export default class PasswordStrengthBar {
  readonly passwordToCheck = input('');

  colors = ['#F00', '#F90', '#FF0', '#9F0', '#0F0'];

  /** The colour of each of the five bars: as many as the password is strong get its strength's colour. */
  readonly barColors = computed(() => {
    const password = this.passwordToCheck();
    const strength = password ? this.getColor(this.measureStrength(password)) : { idx: 0, color: '' };
    return this.colors.map((_, i) => (i < strength.idx ? strength.color : null));
  });

  measureStrength(p: string): number {
    let force = 0;
    const regex = /[$-/:-?{-~!"^_`[\]]/g; // "
    const lowerLetters = /[a-z]+/.test(p);
    const upperLetters = /[A-Z]+/.test(p);
    const numbers = /\d+/.test(p);
    const symbols = regex.test(p);

    const flags = [lowerLetters, upperLetters, numbers, symbols];
    const passedMatches = flags.filter(Boolean).length;

    force += 2 * p.length + (p.length >= 10 ? 1 : 0);
    force += passedMatches * 10;

    // penalty (short password)
    force = p.length <= 6 ? Math.min(force, 10) : force;

    // penalty (poor variety of characters)
    force = passedMatches === 1 ? Math.min(force, 10) : force;
    force = passedMatches === 2 ? Math.min(force, 20) : force;
    force = passedMatches === 3 ? Math.min(force, 40) : force;

    return force;
  }

  getColor(s: number): { idx: number; color: string } {
    let idx = 0;
    if (s > 10) {
      if (s <= 20) {
        idx = 1;
      } else if (s <= 30) {
        idx = 2;
      } else if (s <= 40) {
        idx = 3;
      } else {
        idx = 4;
      }
    }
    return { idx: idx + 1, color: this.colors[idx] };
  }
}
