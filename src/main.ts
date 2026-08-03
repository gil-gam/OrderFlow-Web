import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const saved = localStorage.getItem('theme');
if (saved === 'light') {
  document.documentElement.classList.remove('dark');
} else {
  document.documentElement.classList.add('dark');
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
