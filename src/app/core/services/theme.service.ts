import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

/**
 * Theme Service
 * Manages dark/light mode theme switching
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'legichat_theme';

  // Signal pour le thème actuel
  private themeSignal = signal<Theme>('light');

  // Lecture seule pour les composants
  theme = this.themeSignal.asReadonly();

  constructor() {
    // Charger le thème au démarrage
    this.loadTheme();

    // Appliquer le thème à chaque changement
    effect(() => {
      this.applyTheme(this.themeSignal());
    });
  }

  /**
   * Charge le thème depuis localStorage ou détecte la préférence système
   */
  private loadTheme(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme;

    if (stored === 'light' || stored === 'dark') {
      this.themeSignal.set(stored);
    } else {
      // Détecter la préférence système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.themeSignal.set(prefersDark ? 'dark' : 'light');
    }
  }

  /**
   * Applique le thème au document
   */
  private applyTheme(theme: Theme): void {
    const html = document.documentElement;

    if (theme === 'dark') {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.setAttribute('data-theme', 'light');
    }

    // Sauvegarder dans localStorage
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  /**
   * Toggle entre light et dark
   */
  toggleTheme(): void {
    const newTheme = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.themeSignal.set(newTheme);
  }

  /**
   * Définir un thème spécifique
   */
  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
  }

  /**
   * Obtenir le thème actuel
   */
  getCurrentTheme(): Theme {
    return this.themeSignal();
  }

  /**
   * Vérifier si le mode dark est actif
   */
  isDarkMode(): boolean {
    return this.themeSignal() === 'dark';
  }
}
