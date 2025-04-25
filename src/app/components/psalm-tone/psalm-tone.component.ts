import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-psalm-tone',
  imports: [CommonModule],
  templateUrl: './psalm-tone.component.html',
  styleUrl: './psalm-tone.component.css',
})
export class PsalmToneComponent {
  title = "Psalm";

  loadPsalmTone() {
    // load psalm 1 from assets/psalms/1.json
    fetch('assets/psalms/1.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      }
  };
}
