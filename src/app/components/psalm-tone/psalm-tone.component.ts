import { Component, resource, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToneService, Tone } from 'src/app/services/tone/tone.service';

@Component({
  selector: 'app-psalm-tone',
  imports: [CommonModule, FormsModule],
  templateUrl: './psalm-tone.component.html',
  styleUrl: './psalm-tone.component.scss',
})
export class PsalmToneComponent {
  title = 'Psalm';

  // Available tones from the service
  availableTones: Tone[] = [];

  // Array of psalm numbers (1-90)
  psalmNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

  // Signals for selected values
  selectedPsalmNumber = signal<number>(1);
  selectedTone = signal<string>('');

  // Computed signal for tone image path
  toneImagePath = computed(() => {
    const tone = this.selectedTone();
    return tone ? this.toneService.getTonePath(tone) : '';
  });

  // Reactive psalm resource that updates when selectedPsalmNumber changes
  psalm = resource({
    loader: async () => {
      const psalmNumber = this.selectedPsalmNumber();
      const data = await fetch(`assets/psalms/psalm_${psalmNumber}.json`);
      if (!data.ok) {
        throw new Error(`Failed to load psalm ${psalmNumber}`);
      }
      return data.json();
    },
  });

  constructor(private toneService: ToneService) {
    // Initialize available tones
    this.availableTones = this.toneService.getAvailableTones();

    // Set default tone to first available tone
    if (this.availableTones.length > 0) {
      this.selectedTone.set(this.availableTones[0].filename);
    }

    // Reload resource when psalm number changes (skip initial run)
    let isInitialRun = true;
    effect(() => {
      // Access the signal to create a dependency
      this.selectedPsalmNumber();
      // Skip the initial run since resource loads automatically
      if (isInitialRun) {
        isInitialRun = false;
        return;
      }
      // Reload the resource when the psalm number changes
      this.psalm.reload();
    });
  }

  onPsalmChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedPsalmNumber.set(Number.parseInt(target.value, 10));
  }

  onToneChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedTone.set(target.value);
  }
}
