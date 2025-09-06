import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AppComponent {
  title = 'saas';
}
