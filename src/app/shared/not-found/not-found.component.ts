import { Component } from '@angular/core';
import { routes } from '../../consts';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: [],
  standalone: true,
  imports: [RouterModule],
})
export class NotFoundComponent {
  public routes: typeof routes = routes;
}
