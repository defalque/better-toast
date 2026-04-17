import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToasterService } from 'better-toast';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected toaster = inject(ToasterService);

  protected renderToast() {
    this.toaster.success('Rendered successfully!');
  }
}
