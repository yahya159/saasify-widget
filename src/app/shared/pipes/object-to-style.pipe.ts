import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objectToStyle',
  standalone: true
})
export class ObjectToStylePipe implements PipeTransform {
  transform(value: Record<string, string>): string {
    if (!value) return '';
    
    return Object.entries(value)
      .map(([key, val]) => `${key}: ${val}`)
      .join('; ');
  }
}
