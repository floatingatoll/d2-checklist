import { NgModule } from '@angular/core';

import { SharedModule } from '../shared';


import { PGCRComponent } from './pgcr/pgcr.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [PGCRComponent]
})
export class PGCRModule { }
