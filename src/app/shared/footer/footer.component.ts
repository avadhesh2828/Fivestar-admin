import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

	readonly projectName = environment.Project_Name;
  currentYear :any;
  	constructor() { }

	ngOnInit() {
  var date = new Date();
  var year = date.getFullYear();
  this.currentYear = year;
	}

}
