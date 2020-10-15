import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';
import { debounceTime, first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { FeedService } from '../../services/feed.service';
import { LoaderService } from '../../shared/loader/loader.service';

@Component({
  selector: 'app-matches-news',
  templateUrl: './matches-news.component.html',
  styleUrls: ['./matches-news.component.scss', '../../shared/scss/shared.scss']
})
export class MatchesNewsComponent implements OnInit {
  public matchData = null;
  public error = false;
  public newsError = false;
  public form: FormGroup;
  public submitDisabled = false;
  private seasonId: string;
  public matchNews = null;
  private currentNewsId: string = null;

  @ViewChild('editor', {static: true}) editor: QuillEditorComponent;

  constructor(private feedService: FeedService, private route: ActivatedRoute, private fb: FormBuilder, private toastr: ToastrService, private loaderService: LoaderService) {
    this.form = fb.group({
      editor: ['']
    });
  }

  ngOnInit() {
    this.seasonId = this.route.snapshot.paramMap.get('matchId');
    this.fetchMatchDetail();
    this.initializeForm();
    this.fetchMatchNews();
  }

  fetchMatchDetail() {
    this.feedService.getTeamStats({ season_id: this.seasonId }).pipe(first())
      .subscribe((response: any) => {
        if (response.data) {
          this.matchData = response.data;
        }
        this.error = false;
      }, () => {
        this.error = true;
      });
  }

  initializeForm() {
    this.form.controls.editor.valueChanges.pipe(debounceTime(100))
      .subscribe(() => {
        if (!this.form.valid) {
          this.submitDisabled = true;
        } else if (this.submitDisabled) {
          this.submitDisabled = false;
        }
      });
  }

  fetchMatchNews() {
    this.feedService.getMatchNews({ season_id: this.seasonId }).pipe(first())
      .subscribe((response: any) => {
        console.log(response);
        this.newsError = false;
        this.matchNews = response.data;
        this.loaderService.display(false);
      }, () => {
        this.loaderService.display(false);
        this.newsError = true;
      });
  }

  public formatDate(date) {
    return date.replace(' ', 'T') + 'Z';
  }

  handleNewsSubmit() {
    if (!this.form.value.editor) {
      this.toastr.error('News can not be empty');
      return;
    }
    this.loaderService.display(true);
    if (this.currentNewsId) {
      // Edit existing news
      this.feedService.editMatchNews({ season_news_id: this.currentNewsId, news: this.form.value.editor }).pipe().subscribe(() => {
        this.fetchMatchNews();
        this.form.setControl('editor', new FormControl(''));
        this.currentNewsId = null;
      }, err => {
        this.loaderService.display(false);
        this.toastr.error(err.error.message || 'There was an error');
      });
    } else {
      // Add a new news item
      this.feedService.addMatchNews({ season_id: this.seasonId, news: this.form.value.editor }).pipe().subscribe(() => {
        this.fetchMatchNews();
        this.form.setControl('editor', new FormControl(''));
      }, err => {
        this.loaderService.display(false);
        this.toastr.error(err.error.message || 'There was an error');
      });
    }
  }

  handleEdit(news) {
    this.currentNewsId = news.season_news_id;
    this.form.setControl('editor', new FormControl(news.news));
    window.scroll(0, 0);
  }

  cancelSubmit() {
    this.form.setControl('editor', new FormControl(''));
    this.currentNewsId = null;
  }

  handleDelete(season_news_id) {
    this.loaderService.display(true);
    this.feedService.deleteMatchNews({ season_news_id }).pipe().subscribe(() => {
      this.fetchMatchNews();
    }, err => {
      this.loaderService.display(false);
      this.toastr.error(err.error.message || 'There was an error');
    });
  }
}
