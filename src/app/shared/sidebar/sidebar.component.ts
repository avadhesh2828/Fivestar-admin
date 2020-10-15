import { Component, OnInit, AfterViewInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit {
	contest_type: any;
	newsIcon: any;
	fighterIcon: any;
	fightIcon: any;
	contestIcon: any;

	constructor() { }

	ngOnInit() {
		this.newsIcon = environment.IMG_URL+'/news.png'
		this.fighterIcon = environment.IMG_URL+'/fighter.png'
		this.fightIcon = environment.IMG_URL+'/fight.png'
		this.contestIcon = environment.IMG_URL+'/contest.png'
	}

	ngAfterViewInit() {
		$('.nav-clickable-item a').on('click', function () {
			$('.nav').find('.active').removeClass('active');
			$(this).addClass('active');
		});
	}
}
