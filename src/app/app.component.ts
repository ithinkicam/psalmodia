import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PsalmToneComponent } from './components/psalm-tone/psalm-tone.component';

@Component({
  imports: [PsalmToneComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'psalmodia';
}
