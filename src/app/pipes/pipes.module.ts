import { NgModule } from '@angular/core';

import { SafePipe } from './safe.pipe';
import { RemoveUnderscorePipe } from './remove-underscore.pipe';
import { RoundOffDecimalPipe } from './round-off-decimal';
import { ArraySortPipe } from './array-sort.pipe';
import { UtcDatePipe } from './utc-date.pipe';

@NgModule({
    declarations: [
        SafePipe,
        RemoveUnderscorePipe,
        RoundOffDecimalPipe,
        ArraySortPipe,
        UtcDatePipe,
    ],
    imports: [],
    exports: [
        SafePipe,
        RemoveUnderscorePipe,
        RoundOffDecimalPipe,
        ArraySortPipe,
        UtcDatePipe,
    ],
    providers: [
        SafePipe,
        RemoveUnderscorePipe,
        RoundOffDecimalPipe,
        ArraySortPipe,
        UtcDatePipe,
    ]
})
export class FantasyPipeModule { }
