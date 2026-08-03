import { Component, effect, signal } from '@angular/core';

const THEME_KEY = 'theme';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly isDark = signal(this.getInitialTheme());

  constructor() {
    effect(() => {
      const dark = this.isDark();
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    });
  }

  protected toggleTheme(): void {
    this.isDark.update((value) => !value);
  }

  private getInitialTheme(): boolean {
    const stored = localStorage.getItem(THEME_KEY);
    return stored ? stored === 'dark' : true;
  }
}
