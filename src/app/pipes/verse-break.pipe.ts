import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'verseBr',
  standalone: true,
})
export class VerseBrPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    // Add line breaks before verse numbers (1-9 preceded by space or at start, followed by space)
    // This regex matches a space followed by a single or double digit number followed by a space
    return value.replace(/\s(\d+)\s/g, '\n$1 ');
  }
}
