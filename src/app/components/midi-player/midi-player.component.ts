import {
  Component,
  input,
  effect,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MidiPlayerService } from '../../services/midi/midi-player.service';

@Component({
  selector: 'app-midi-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="midi-player">
      <div class="controls">
        <button
          (click)="togglePlayPause()"
          class="control-btn"
          [class.playing]="isPlaying()"
          aria-label="Play/Pause"
        >
          {{ isPlaying() ? '⏸' : '▶' }}
        </button>

        <button
          (click)="transposeUp()"
          class="control-btn transpose-btn"
          aria-label="Transpose Up"
        >
          ↑
        </button>

        <span class="transposition-display">
          {{ getTranspositionDisplay() }}
        </span>

        <button
          (click)="transposeDown()"
          class="control-btn transpose-btn"
          aria-label="Transpose Down"
        >
          ↓
        </button>

        <button
          (click)="resetTransposition()"
          class="control-btn reset-btn"
          aria-label="Reset Transposition"
        >
          ✕
        </button>
      </div>

      <div class="status">
        {{ statusMessage() }}
      </div>
    </div>
  `,
  styles: [
    `
      .midi-player {
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 0.5rem;
        background-color: #f9f9f9;
        margin-top: 1rem;
      }

      .controls {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
      }

      .control-btn {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        border: 1px solid #ccc;
        border-radius: 0.25rem;
        background-color: #fff;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background-color: #e9e9e9;
          border-color: #999;
        }

        &:active {
          background-color: #d9d9d9;
        }

        &.playing {
          background-color: #4caf50;
          color: white;
          border-color: #45a049;

          &:hover {
            background-color: #45a049;
          }
        }
      }

      .transpose-btn {
        padding: 0.5rem 0.75rem;
        min-width: 2.5rem;
      }

      .reset-btn {
        padding: 0.5rem 0.75rem;
        min-width: 2.5rem;
        background-color: #f0f0f0;

        &:hover {
          background-color: #e0e0e0;
        }
      }

      .transposition-display {
        font-weight: bold;
        min-width: 3rem;
        text-align: center;
        font-size: 0.9rem;
      }

      .status {
        font-size: 0.875rem;
        color: #666;
        min-height: 1.2rem;
      }
    `,
  ],
})
export class MidiPlayerComponent implements OnInit, OnDestroy {
  selectedTone = input<string | null>(null);

  isPlaying = signal(false);
  statusMessage = signal('Ready');

  private currentFilename: string | null = null;

  constructor(private midiService: MidiPlayerService) {
    // Auto-load MIDI when selectedTone changes
    effect(async () => {
      const tone = this.selectedTone();
      if (tone) {
        try {
          // Extract tone name without .svg extension (e.g., "1A.svg" -> "1A")
          const toneName = tone.replace('.svg', '');
          this.statusMessage.set('Loading...');
          await this.midiService.loadMidiFile(toneName);
          this.midiService.stop();
          this.isPlaying.set(false);
          this.currentFilename = toneName;
          this.statusMessage.set(`Loaded: Tone ${toneName}`);
        } catch (error) {
          this.statusMessage.set('Error loading MIDI');
          console.error('MIDI load error:', error);
        }
      }
    });
  }

  ngOnInit(): void {
    // Initialize
  }

  ngOnDestroy(): void {
    this.midiService.stop();
  }

  togglePlayPause(): void {
    if (!this.currentFilename) {
      this.statusMessage.set('No tone loaded');
      return;
    }

    if (this.isPlaying()) {
      this.midiService.pause();
      this.isPlaying.set(false);
      this.statusMessage.set('Paused');
    } else {
      this.midiService.play();
      this.isPlaying.set(true);
      this.statusMessage.set('Playing...');
    }
  }

  transposeUp(): void {
    this.midiService.transposeUp();
    this.updateTranspositionDisplay();
  }

  transposeDown(): void {
    this.midiService.transposeDown();
    this.updateTranspositionDisplay();
  }

  resetTransposition(): void {
    this.midiService.resetTransposition();
    this.updateTranspositionDisplay();
  }

  getTranspositionDisplay(): string {
    const transposition = this.midiService.getTransposition();
    if (transposition > 0) {
      return `+${transposition}`;
    } else if (transposition < 0) {
      return `${transposition}`;
    } else {
      return '0';
    }
  }

  private updateTranspositionDisplay(): void {
    if (this.isPlaying()) {
      this.statusMessage.set(`Transposed: ${this.getTranspositionDisplay()}`);
    }
  }
}
