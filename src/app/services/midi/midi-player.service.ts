import { Injectable } from '@angular/core';
import * as Tone from 'tone';

// Simple MIDI data structure for note events
interface MidiNote {
  time: number;
  pitch: number;
  velocity: number;
  duration: number;
}

interface MidiHeader {
  ticksPerBeat: number;
  tempoMicrosPerBeat: number;
}

interface SimpleMidiData {
  header: MidiHeader;
  notes: MidiNote[];
}

export interface MidiPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  transposition: number;
}

@Injectable({
  providedIn: 'root',
})
export class MidiPlayerService {
  private midiData: SimpleMidiData | null = null;
  private synth: Tone.Synth | null = null;
  private now = Tone.now;
  private transposition = 0;
  private isPlaying = false;
  private playbackStartTime = 0;
  private pausedTime = 0;
  private playbackPromise: Promise<void> | null = null;
  private abortController: AbortController | null = null;

  constructor() {
    this.initializeSynth();
    this.loadTranspositionFromStorage();
  }

  private initializeSynth(): void {
    if (!this.synth && typeof window !== 'undefined') {
      try {
        this.synth = new Tone.Synth({
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 0.1,
          },
        }).toDestination();
      } catch (e) {
        console.warn('Failed to initialize synth:', e);
      }
    }
  }

  private loadTranspositionFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('midi-transposition');
      this.transposition = stored ? parseInt(stored, 10) : 0;
    }
  }

  private saveTranspositionToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('midi-transposition', this.transposition.toString());
    }
  }

  /**
   * Load MIDI file from URL and parse basic note data
   */
  async loadMidiFile(filename: string): Promise<void> {
    try {
      const response = await fetch(
        `/assets/psalms/tones/sarum/${filename}.mid`
      );
      const arrayBuffer = await response.arrayBuffer();

      // Parse basic MIDI structure
      this.midiData = this.parseMidiFile(arrayBuffer);
      this.pausedTime = 0;
      this.isPlaying = false;
    } catch (error) {
      console.error('Failed to load MIDI file:', error);
      throw error;
    }
  }

  /**
   * Simple MIDI file parser - extracts note on/off events
   */
  private parseMidiFile(buffer: ArrayBuffer): SimpleMidiData {
    const view = new DataView(buffer);
    let offset = 0;

    // Parse MIDI header
    const headerChunk = this.readChunk(view, offset);
    offset += 8 + headerChunk.length;

    const ticksPerBeat = view.getUint16(headerChunk.offset + 6);
    const tempoMicrosPerBeat = 500000; // Default tempo (120 BPM)

    // Parse tracks to extract notes
    const notes: MidiNote[] = [];
    let trackNum = 0;

    while (offset < view.byteLength && trackNum < 16) {
      try {
        const trackChunk = this.readChunk(view, offset);
        const trackNotes = this.parseTrack(
          view,
          trackChunk.offset,
          trackChunk.length,
          ticksPerBeat
        );
        notes.push(...trackNotes);
        offset += 8 + trackChunk.length;
        trackNum++;
      } catch (e) {
        break;
      }
    }

    // Sort notes by time
    notes.sort((a, b) => a.time - b.time);

    return {
      header: { ticksPerBeat, tempoMicrosPerBeat },
      notes,
    };
  }

  /**
   * Read a MIDI chunk
   */
  private readChunk(
    view: DataView,
    offset: number
  ): { type: string; length: number; offset: number } {
    const type = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );
    const length = view.getUint32(offset + 4);
    return { type, length, offset: offset + 8 };
  }

  /**
   * Parse MIDI track to extract note events
   */
  private parseTrack(
    view: DataView,
    offset: number,
    length: number,
    ticksPerBeat: number
  ): MidiNote[] {
    const notes: MidiNote[] = [];
    const endOffset = offset + length;
    let currentTime = 0;
    const activeNotes: Map<number, { time: number; velocity: number }> =
      new Map();

    let pos = offset;
    while (pos < endOffset) {
      // Read variable length quantity (delta time)
      const deltaResult = this.readVariableLengthQuantity(view, pos);
      currentTime += deltaResult.value;
      pos = deltaResult.nextPos;

      // Read status byte
      const status = view.getUint8(pos);
      pos++;

      if (status === 0xff) {
        // Meta event
        const metaType = view.getUint8(pos);
        pos++;
        const lenResult = this.readVariableLengthQuantity(view, pos);
        pos = lenResult.nextPos + lenResult.value;
      } else if ((status & 0xf0) === 0x90) {
        // Note On
        const channel = status & 0x0f;
        const pitch = view.getUint8(pos);
        pos++;
        const velocity = view.getUint8(pos);
        pos++;

        if (velocity > 0) {
          activeNotes.set(pitch, { time: currentTime, velocity });
        } else {
          // Note off
          const noteInfo = activeNotes.get(pitch);
          if (noteInfo) {
            const duration =
              ((currentTime - noteInfo.time) / ticksPerBeat) * 0.5;
            notes.push({
              time: (noteInfo.time / ticksPerBeat) * 0.5,
              pitch,
              velocity: noteInfo.velocity,
              duration: Math.max(0.1, duration),
            });
            activeNotes.delete(pitch);
          }
        }
      } else if ((status & 0xf0) === 0x80) {
        // Note Off
        const pitch = view.getUint8(pos);
        pos++;
        pos++; // velocity
        const noteInfo = activeNotes.get(pitch);
        if (noteInfo) {
          const duration = ((currentTime - noteInfo.time) / ticksPerBeat) * 0.5;
          notes.push({
            time: (noteInfo.time / ticksPerBeat) * 0.5,
            pitch,
            velocity: noteInfo.velocity,
            duration: Math.max(0.1, duration),
          });
          activeNotes.delete(pitch);
        }
      } else if ((status & 0xf0) === 0xb0) {
        // Control Change
        pos += 2;
      } else if ((status & 0xf0) === 0xc0) {
        // Program Change
        pos++;
      } else if ((status & 0xf0) === 0xe0) {
        // Pitch Bend
        pos += 2;
      }
    }

    return notes;
  }

  /**
   * Read variable length quantity from MIDI
   */
  private readVariableLengthQuantity(
    view: DataView,
    offset: number
  ): { value: number; nextPos: number } {
    let value = 0;
    let pos = offset;

    while (pos < view.byteLength) {
      const byte = view.getUint8(pos);
      value = (value << 7) | (byte & 0x7f);
      pos++;
      if ((byte & 0x80) === 0) {
        break;
      }
    }

    return { value, nextPos: pos };
  }

  /**
   * Play MIDI file
   */
  async play(): Promise<void> {
    if (!this.midiData || !this.synth) return;

    if (this.isPlaying) return;

    // Resume Tone.js audio context if needed
    await Tone.start();

    this.isPlaying = true;
    this.playbackStartTime = Tone.now() - this.pausedTime;
    this.abortController = new AbortController();

    // Schedule all notes
    this.scheduleNotes(this.abortController.signal);
  }

  /**
   * Pause MIDI playback
   */
  pause(): void {
    this.isPlaying = false;
    this.pausedTime = Tone.now() - this.playbackStartTime;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Stop MIDI playback and reset
   */
  stop(): void {
    this.isPlaying = false;
    this.pausedTime = 0;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.synth) {
      this.synth.triggerRelease(Tone.now());
    }
  }

  /**
   * Transpose up by semitones
   */
  transposeUp(): void {
    this.transposition++;
    this.saveTranspositionToStorage();
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  /**
   * Transpose down by semitones
   */
  transposeDown(): void {
    this.transposition--;
    this.saveTranspositionToStorage();
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  /**
   * Get current transposition level
   */
  getTransposition(): number {
    return this.transposition;
  }

  /**
   * Reset transposition to 0
   */
  resetTransposition(): void {
    this.transposition = 0;
    this.saveTranspositionToStorage();
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  /**
   * Get playback state
   */
  getState(): MidiPlayerState {
    const duration = this.midiData
      ? Math.max(...this.midiData.notes.map((n) => n.time + n.duration))
      : 0;
    const currentTime = this.pausedTime;

    return {
      isPlaying: this.isPlaying,
      currentTime,
      duration,
      transposition: this.transposition,
    };
  }

  /**
   * Schedule notes for playback with transposition
   */
  private scheduleNotes(signal: AbortSignal): void {
    if (!this.midiData || !this.synth) return;

    const notes = this.midiData.notes;

    notes.forEach((note) => {
      // Calculate when this note should play
      const noteTime = this.playbackStartTime + note.time;
      const delay = noteTime - Tone.now();

      if (delay > 0) {
        // Schedule for future playback
        Tone.Transport.schedule(() => {
          if (!signal.aborted && this.isPlaying) {
            this.playNote(
              note.pitch + this.transposition,
              note.velocity,
              note.duration
            );
          }
        }, noteTime);
      } else if (delay > -note.duration) {
        // Note start time has passed, but it might still be playing
        // Only play if we're within the note duration window
        const adjustedDuration = note.duration + delay;
        if (adjustedDuration > 0 && !signal.aborted && this.isPlaying) {
          this.playNote(
            note.pitch + this.transposition,
            note.velocity,
            adjustedDuration
          );
        }
      }
    });

    // Start transport if not already running
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }
  }

  /**
   * Play a single note using Tone.js synth
   */
  private playNote(pitch: number, velocity: number, duration: number): void {
    if (!this.synth) return;

    try {
      // Convert MIDI pitch to frequency
      const frequency = 440 * Math.pow(2, (pitch - 69) / 12);

      // Convert velocity to gain (0-127 -> 0-1)
      const gain = (velocity / 127) * 0.5;

      // Schedule note on and off
      const now = Tone.now();
      this.synth.volume.value = Tone.gainToDb(gain);
      this.synth.triggerAttackRelease(frequency, duration, now);
    } catch (error) {
      console.error('Error playing note:', error);
    }
  }

  /**
   * Check if MIDI is currently playing
   */
  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}
