import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-pga-championship',
  templateUrl: './pga-championship.component.html',
  styleUrls: ['./pga-championship.component.scss']
})
export class PgaChampionshipComponent implements OnInit {

  @Input() league: any;
  @Input() gameStyle: any;
  @Input() sizeType: any;
  @Input() parentFormGroup: any;
  @Input() submitted: boolean;
  @Input() formError: any;

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    console.log('league', this.league);
    console.log('gameStyle', this.gameStyle);
    console.log('sizeType', this.sizeType);
  }
}
