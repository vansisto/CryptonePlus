import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme: boolean = false;

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    const themeClass = this.isDarkTheme ? 'dark-theme' : 'light-theme';

    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(themeClass);

    localStorage.setItem('theme', themeClass)
  }

  loadTheme(): void {
    const savedTheme = localStorage.getItem('theme') ?? 'light-theme';
    document.body.classList.add(savedTheme);
    this.isDarkTheme = savedTheme === 'dark-theme';
  }
}
