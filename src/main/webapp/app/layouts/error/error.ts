import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'jhi-error',
  imports: [RouterLink],
  templateUrl: './error.html',
})
export default class Error implements OnInit {
  readonly errorMessage = signal<string | undefined>(undefined);

  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.data.subscribe(routeData => {
      this.errorMessage.set(routeData.errorMessage);
    });
  }
}
