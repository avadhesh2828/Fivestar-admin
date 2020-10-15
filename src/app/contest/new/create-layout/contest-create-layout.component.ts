import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { Router } from '@angular/router';
import { LeagueService } from '../../../services/league.service';

@Component({
  selector: 'app-contest-create-layout',
  templateUrl: './contest-create-layout.component.html',
  styleUrls: ['./contest-create-layout.component.scss']
})
export class ContestCreateLayoutComponent implements OnInit {

  public leagues = [];
  public selectedLeague: any = '';
  public gameStyles = [];
  public selectedGameStyle: any = '';
  public sizeTypes = [];
  public selectedSizeType: any = '';

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private leagueService: LeagueService
  ) { }

  ngOnInit() {

    this.leagueService.getAllLeagues().subscribe((res: any) => {
      this.leagues = res.data;
    }, (err: any) => {
      this.leagues = [];
      this.toastr.error(err.error.global_error || 'There was an error.');
    });

  }

  setLeague(league) {
    this.selectedLeague = league;

    this.leagueService.getGameStyles(this.selectedLeague.season.season_id).subscribe((res: any) => {
      this.gameStyles = res.data;
    }, (err: any) => {
      this.gameStyles = [];
      this.toastr.error(err.error.global_error || 'There was an error.');
    });

  }

  getSizes() {

    this.leagueService.getSizes(this.selectedLeague.league_url_name, this.selectedGameStyle.abbr).subscribe((res: any) => {
      this.sizeTypes = res.data;
    }, (err: any) => {
      this.sizeTypes = [];
      this.toastr.error(err.error.global_error || 'There was an error.');
    });

  }

  setGameStyle(gameStyle) {
    this.selectedGameStyle = gameStyle;
    this.getSizes();
  }

  setSizeType(sizeType) {
    this.selectedSizeType = sizeType;
  }

  done() {
    let route = `/contest/create/${this.selectedLeague.league_url_name}/${this.selectedGameStyle.abbr}`;
    this.router.navigate([route], { state: { pre: { league: this.selectedLeague, gameStyle: this.selectedGameStyle, sizeType: this.selectedSizeType } } });
  }
}
