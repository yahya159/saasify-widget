import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService } from '../../core/services/mock-api.service';

@Component({
  selector: 'app-plans-dashboard',
  templateUrl: './plans-dashboard.component.html',
  styleUrls: ['./plans-dashboard.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class PlansDashboardComponent {
  mockApi = inject(MockApiService);
}