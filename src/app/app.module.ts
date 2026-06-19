import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, provideRouter } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { AppComponent } from './app.component';
import { APP_ROUTES } from './app.routes';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpInterceptor } from './shared/services/http-interceptor.service';

registerLocaleData(localeEs);

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
    provideZoneChangeDetection(),
    provideRouter(APP_ROUTES),
    provideHttpClient(withInterceptors([httpInterceptor])),
    { provide: LOCALE_ID, useValue: 'es' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
