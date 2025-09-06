import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-template-thumbnail',
  templateUrl: './template-thumbnail.component.html',
  styleUrls: ['./template-thumbnail.component.css'],
  imports: [CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class TemplateThumbnailComponent {
  templateName = input('');
  templateType = input('');
  imageSrc = input('');

  getImageAlt(): string {
    return `${this.templateName()} template preview`;
  }

  getImageSrc(): string {
    // Template thumbnail images using NgOptimizedImage
    const imageMap: Record<string, string> = {
      '3-column-classic': 'assets/templates/3-column-classic.svg',
      '2-column-spotlight': 'assets/templates/2-column-spotlight.svg',
      'comparison-matrix': 'assets/templates/comparison-matrix.svg'
    };
    
    return imageMap[this.templateType()] || 'assets/templates/3-column-classic.svg';
  }
}
