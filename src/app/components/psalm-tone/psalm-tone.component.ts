import {
  Component,
  resource,
  signal,
  computed,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToneService, Tone } from 'src/app/services/tone/tone.service';
import {
  PsalmService,
  PsalmVersion,
  Psalm,
  PsalmOption,
} from 'src/app/services/psalm/psalm.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { VerseBrPipe } from 'src/app/pipes/verse-break.pipe';
import { MidiPlayerComponent } from '../midi-player/midi-player.component';

@Component({
  selector: 'app-psalm-tone',
  imports: [CommonModule, FormsModule, VerseBrPipe, MidiPlayerComponent],
  templateUrl: './psalm-tone.component.html',
  styleUrl: './psalm-tone.component.scss',
})
export class PsalmToneComponent {
  private toneService = inject(ToneService);
  private psalmService = inject(PsalmService);
  private storageService = inject(StorageService);

  title = 'Psalm';

  // Available tones from the service
  availableTones: Tone[] = [];

  // Available psalm versions
  availableVersions: Array<{ id: PsalmVersion; name: string }> = [];

  // Array of psalm options (includes multi-part psalms for Coverdale)
  psalmOptions: PsalmOption[] = [];

  // Signals for selected values
  selectedPsalmNumber = signal<number>(1);
  selectedPsalmPart = signal<number | undefined>(undefined);
  selectedTone = signal<string>('');
  selectedPsalmVersion = signal<PsalmVersion>('coverdale');
  userManuallySelectedTone = signal<boolean>(false);

  // Computed signal for tone image path
  toneImagePath = computed(() => {
    const tone = this.selectedTone();
    return tone ? this.toneService.getTonePath(tone) : '';
  });

  // Reactive psalm resource that updates when selectedPsalmNumber, part, or version changes
  psalm = resource({
    loader: async () => {
      const psalmNumber = this.selectedPsalmNumber();
      const part = this.selectedPsalmPart();
      const version = this.selectedPsalmVersion();
      return this.psalmService
        .getPsalm(psalmNumber, version, part)
        .toPromise() as Promise<Psalm>;
    },
  });

  constructor() {
    // Initialize available tones
    this.availableTones = this.toneService.getAvailableTones();

    // Set default tone to first available tone
    if (this.availableTones.length > 0) {
      this.selectedTone.set(this.availableTones[0].filename);
    }

    // Initialize available psalm versions
    this.availableVersions = this.psalmService.getAvailableVersions();

    // Load preferred version or use default
    const preferred =
      this.storageService.getPreferredPsalmVersion() as PsalmVersion;
    this.selectedPsalmVersion.set(preferred || 'coverdale');

    // Initialize psalm options
    this.psalmOptions = this.psalmService.getAvailablePsalmOptions();

    // Reload resource when psalm number, part, or version changes (skip initial run)
    let isInitialRun = true;
    effect(() => {
      // Access the signals to create dependencies
      this.selectedPsalmNumber();
      this.selectedPsalmPart();
      this.selectedPsalmVersion();
      // Skip the initial run since resource loads automatically
      if (isInitialRun) {
        isInitialRun = false;
        return;
      }
      // Reload the resource when the psalm number, part, or version changes
      this.psalm.reload();
    });

    // Auto-select recommended tone when psalm loads
    effect(() => {
      const psalmData = this.psalm.value();
      if (psalmData && psalmData.recommended_tone) {
        // Only auto-select if user hasn't manually set a tone
        if (!this.userManuallySelectedTone()) {
          this.selectedTone.set(psalmData.recommended_tone);
        }
      }
    });

    // Reset manual tone selection when psalm changes
    effect(() => {
      this.selectedPsalmNumber();
      this.selectedPsalmPart();
      // Reset the flag when user selects a new psalm
      this.userManuallySelectedTone.set(false);
    });
  }

  onPsalmChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedOption = this.psalmOptions.find(
      (opt) => opt.display === target.options[target.selectedIndex].text
    );
    if (selectedOption) {
      this.selectedPsalmNumber.set(selectedOption.psalm_number);
      this.selectedPsalmPart.set(selectedOption.part);
    }
  }

  onToneChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedTone.set(target.value);
    // Mark that user manually selected a tone
    this.userManuallySelectedTone.set(true);
  }

  onVersionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const version = target.value as PsalmVersion;
    this.selectedPsalmVersion.set(version);
    this.storageService.setPreferredPsalmVersion(version);
  }
}
