import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContestService } from '../../../../../services/contest.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-new-contest-prizing',
  templateUrl: './prizing.component.html',
  styleUrls: ['./prizing.component.scss']
})
export class PrizingComponent implements OnInit {

  @Input() parentFormGroup: FormGroup;
  @Input() submitted: boolean;
  @Input() formError: any;

  public prizes = [];
  public prizePool: number = 0;
  public prizeComposition = [];

  constructor(
    private contestService: ContestService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {

    this.parentFormGroup.addControl('prizePayout', new FormControl('', Validators.required));
    this.parentFormGroup.addControl('prizePool', new FormControl('', Validators.required));
    this.parentFormGroup.addControl('gameSize', new FormControl(20, [Validators.required, Validators.min(5), Validators.max(100)]));
    this.parentFormGroup.addControl('siteRake', new FormControl(9, Validators.required));
    this.parentFormGroup.addControl('entryFees', new FormControl(10, [Validators.required, Validators.min(0), Validators.max(10000)]));

    this.contestService.getPrizes('multiplayer').subscribe((res: any) => {
      this.prizes = res.data;
    }, (err: any) => {
      this.prizes = [];
      this.toastr.error(err.error.global_error || 'There was an error.');
    });
  }

  get f() {
    return this.parentFormGroup.controls;
  }

  calculatePrizePool() {

    let siteRake = (this.f.entryFees.value * this.f.gameSize.value) * (this.f.siteRake.value / 100);
    let prizePool = (this.f.entryFees.value * this.f.gameSize.value) - siteRake;
    this.prizePool = (prizePool <= 0) ? 0 : prizePool;

    this.f.prizePool.setValue(this.prizePool);

    this.calculatePrizeDistributionAmount();
  }

  calculatePrizeDistributionAmount() {

    let composition = [];
    let msg = '';
    let type = 'error';
    this.prizeComposition = []
    this.prizes.map((prize: any) => {

      if (prize.master_prize_id == this.f.prizePayout.value) {
        composition = JSON.parse(prize.composition)
      }
    });

    if (composition.length > 0) {

      composition.map((val, index) => {
        this.computeAmountOnRank(val)
      });
    }
  }

  computeAmountOnRank(separation) {

    if (isNaN(separation.max_place)) {
      let diviser = separation.max_place.split('/')[1]
      switch (parseInt(diviser)) {
        case 2:
          this.prizeComposition.push(`Top 50 % will get $${this.prizePool}`)
          break;
        case 3:
          this.prizeComposition.push(`Top 30 % will get $${this.prizePool}`)
          break;
      }

    } else {
      let rankMsg = 'Top '
      rankMsg += (separation.max_place == separation.min_place) ? separation.max_place : separation.min_place + ' - ' + separation.max_place;
      let amount: any;
      amount = this.prizePool * (separation.value / 100);
      amount = amount.toFixed(2);
      this.prizeComposition.push(`${rankMsg} will get $${amount}`);
    }
  }

}
