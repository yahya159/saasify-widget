import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { WidgetBlockType } from '../../../../core/models/pricing.models';

@Component({
  selector: 'app-palette',
  templateUrl: './palette.component.html',
  styleUrls: ['./palette.component.css'],
  imports: [CommonModule, CdkDrag, CdkDropList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class PaletteComponent {
  onDragStarted(): void {
    // Add visual feedback when drag starts
    document.body.classList.add('dragging-active');
  }

  onDragEnded(): void {
    // Remove visual feedback when drag ends
    document.body.classList.remove('dragging-active');
  }

  readonly blockTypes: { type: WidgetBlockType; label: string; description: string; icon: string }[] = [
    {
      type: 'price-card',
      label: 'Price Card',
      description: 'Display pricing and CTA',
      icon: '💰'
    },
    {
      type: 'feature-list',
      label: 'Feature List',
      description: 'List of features',
      icon: '✅'
    },
    {
      type: 'headline',
      label: 'Headline',
      description: 'Main heading text',
      icon: '📝'
    },
    {
      type: 'subtext',
      label: 'Subtext',
      description: 'Supporting text',
      icon: '📄'
    },
    {
      type: 'badge',
      label: 'Badge',
      description: 'Highlight badge',
      icon: '🏷️'
    },
    {
      type: 'divider',
      label: 'Divider',
      description: 'Visual separator',
      icon: '➖'
    }
  ];
}
