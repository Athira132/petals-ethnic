import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { WhatsappButtonComponent } from './shared/components/whatsapp-button/whatsapp-button.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, WhatsappButtonComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isAdminRoute = false;
  showIntro = true;
  introFading = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminRoute = event.url.startsWith('/admin');
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }
    });

    // Dismiss intro screen as soon as essential resources initialize
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.dismissIntro();
      }, 400);

      // Safety fallback: maximum 800ms
      setTimeout(() => {
        this.showIntro = false;
      }, 800);
    }
  }

  dismissIntro() {
    if (!this.introFading) {
      this.introFading = true;
      setTimeout(() => {
        this.showIntro = false;
      }, 250);
    }
  }
}
