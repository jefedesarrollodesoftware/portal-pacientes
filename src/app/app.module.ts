import { BrowserModule } from '@angular/platform-browser';
import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, provideRouter } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { APP_ROUTES } from './app.routes';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { MAT_SELECT_CONFIG } from '@angular/material/select';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpInterceptor } from './shared/services/http-interceptor.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NotFoundComponent,
    BrowserAnimationsModule,
    RouterModule,
    ToastrModule.forRoot(),
  ],
  providers: [
    {
      provide: MAT_SELECT_CONFIG,
      useValue: {
        hideSingleSelectionIndicator: true,
        panelWidth: null,
      },
    },
    provideZoneChangeDetection(),
    provideRouter(APP_ROUTES),
    provideHttpClient(withInterceptors([httpInterceptor])),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
