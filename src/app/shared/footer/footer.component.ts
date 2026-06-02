import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: [],
  standalone: true,
  imports: [],
})
export class FooterComponent {
  public flatlogic: string = 'https://flatlogic.com/';
  public flatlogicAbout: string = 'https://flatlogic.com/about';
  public flatlogicBlog: string = 'https://flatlogic.com/blog';
}
