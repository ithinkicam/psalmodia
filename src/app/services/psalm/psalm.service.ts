import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Psalm {
  psalm_number: number;
  latin_name?: string;
  text: string;
  annotated_text?: string;
  part?: number;
  recommended_tone?: string;
}

export interface PsalmOption {
  psalm_number: number;
  part?: number;
  display: string;
}

export interface PsalmCollection {
  version: string;
  name: string;
  description: string;
  psalms: Psalm[];
}

export type PsalmVersion = 'original' | '1979-bcp' | 'coverdale';

@Injectable({
  providedIn: 'root',
})
export class PsalmService {
  private psalmCache: Map<string, PsalmCollection> = new Map();

  /**
   * Available psalm versions
   */
  getAvailableVersions(): Array<{ id: PsalmVersion; name: string }> {
    return [
      { id: 'original', name: 'Original' },
      { id: '1979-bcp', name: '1979 Book of Common Prayer' },
      { id: 'coverdale', name: 'Coverdale' },
    ];
  }

  /**
   * Get a psalm from local JSON files with specified version and optional part
   * @param psalmNumber Psalm number (1-150)
   * @param version Psalm version to load (default: '1979-bcp')
   * @param part Optional part number for multi-part psalms (e.g., part 1 of 22 for Psalm 119)
   */
  getPsalm(
    psalmNumber: number,
    version: PsalmVersion = '1979-bcp',
    part?: number
  ): Observable<Psalm> {
    if (version === 'original') {
      // For original version, load individual psalm files
      return new Observable((observer) => {
        fetch(`assets/psalms/psalm_${psalmNumber}.json`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to load psalm ${psalmNumber}`);
            }
            return response.json();
          })
          .then((psalm) => {
            observer.next(psalm);
            observer.complete();
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    }

    if (version === 'coverdale') {
      // For Coverdale, try individual files (may be multi-part)
      return new Observable((observer) => {
        // Build filename: psalm_N.json or psalm_N_P.json for parts
        const filename = part
          ? `psalm_${psalmNumber}_${part}.json`
          : `psalm_${psalmNumber}.json`;
        fetch(`assets/psalms/coverdale/${filename}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                `Failed to load psalm ${psalmNumber}${
                  part ? ` part ${part}` : ''
                }`
              );
            }
            return response.json();
          })
          .then((psalm) => {
            observer.next(psalm);
            observer.complete();
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    }

    // For other versions, load from collection
    return new Observable((observer) => {
      this.loadPsalmVersion(version)
        .then((collection) => {
          const psalm = collection.psalms.find(
            (p) => p.psalm_number === psalmNumber
          );
          if (!psalm) {
            throw new Error(
              `Psalm ${psalmNumber} not found in ${version} version`
            );
          }
          observer.next(psalm);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  /**
   * Load a specific psalm version collection
   * @private
   */
  private loadPsalmVersion(version: PsalmVersion): Promise<PsalmCollection> {
    // Check cache first
    if (this.psalmCache.has(version)) {
      const cached = this.psalmCache.get(version);
      if (cached) {
        return Promise.resolve(cached);
      }
    }

    // Map version to file path
    const filePath = this.getFilePath(version);

    return fetch(filePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load psalm version: ${version}`);
        }
        return response.json();
      })
      .then((data) => {
        this.psalmCache.set(version, data);
        return data;
      });
  }

  /**
   * Get all available psalm options for Coverdale version (includes multi-part psalms)
   * Multi-part psalms are: 18 (2 parts), 25 (2 parts), 42 (2 parts), 44 (2 parts),
   * 52 (2 parts), 68 (2 parts), 80 (2 parts), 119 (22 parts)
   */
  getAvailablePsalmOptions(): PsalmOption[] {
    const options: PsalmOption[] = [];
    const multiPartPsalms: Record<number, number> = {
      18: 2,
      25: 2,
      42: 2,
      44: 2,
      52: 2,
      68: 2,
      80: 2,
      119: 22,
    };

    for (let i = 1; i <= 150; i++) {
      if (multiPartPsalms[i]) {
        // Add all parts for multi-part psalms
        for (let p = 1; p <= multiPartPsalms[i]; p++) {
          options.push({
            psalm_number: i,
            part: p,
            display: `Psalm ${i} Part ${p}`,
          });
        }
      } else {
        // Add single-part psalms
        options.push({
          psalm_number: i,
          display: `Psalm ${i}`,
        });
      }
    }

    return options;
  }

  /**
   * Get the file path for a psalm version
   * @private
   */
  private getFilePath(version: PsalmVersion): string {
    switch (version) {
      case '1979-bcp':
        return 'assets/psalms/psalms-1979-bcp.json';
      case 'coverdale':
        return 'assets/psalms/psalms-coverdale.json';
      default:
        return 'assets/psalms/psalms-1979-bcp.json';
    }
  }
}
