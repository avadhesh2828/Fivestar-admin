import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import * as moment from 'moment';
import { NewsService } from '../../services/news.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDateTime, formatDate } from '../../services/utils.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { LoaderService } from '../../shared/loader/loader.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-news-edit',
  templateUrl: './news-edit.component.html',
  styleUrls: ['./news-edit.component.scss']
})
export class NewsEditComponent implements OnInit {
  public newNewsForm: FormGroup;
  formSubmitted = false;
  formError: any;
  submitted = false;
  maxChars = 200;
  remainChars:any ='';
  public error = false;
  minDate: Date;
  public imagePath;
  imgURL: any;
  imgName: any;
  imgPath: any;
  public message: string;
  imgErrorMsg:any;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  public advPositionList = [];
  public stateList = [];
  public isSameAdd=false;
  public currentPosition ='';
  public buttonDisabled = true;
  public isFeatured = '1';
  public news:any;
  oldImgURL:any;
  public publicationDate:Date;


  constructor(
    private newsService: NewsService, private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    const youtube_reg = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    this.oldImgURL = environment.NEWS_IMG_URL; 
    this.getNewsDetailById();
    this.newNewsForm = this.formBuilder.group({
      title:['',   [Validators.required, Validators.minLength(4),Validators.maxLength(30)]],
      isFeatured:['',   []],
      newsDescription: ['',   [Validators.required]],
      videoURL: ['', Validators.pattern(youtube_reg)],
      adv_image:[''],
      publicationDate:['',[Validators.required]],
    });
    this.minDate = new Date();
  }

  private getNewsDetailById() {
    this.loaderService.display(true);
    const id = this.route.snapshot.paramMap.get('newsId');
    this.newsService.getNewsDetailById(id)
      .subscribe((res) => {
        this.loaderService.display(false);
        if (res['data']) {
          this.news = res['data'];
          this.isFeatured = this.news.is_featured;
          this.publicationDate = new Date(this.news.publication_date);
          //this.oldUserName = this.user['user_name'];
        }
      }, (err: object) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }
  formatDate(date) {
    return moment(date).format('YYYY-MM-DD');
  }
  get f() {
    return this.newNewsForm.controls;
  }
  
  //previow of image before upload
  preview(files) {
    if(!this.f.title.value){
      this.toastr.error('Please select new title.');  
      this.formSubmitted = false;
      this.f.adv_image.setValue('');
      return;
    }
    if (files.length === 0){
      return;
    }
    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.imgErrorMsg = "Only images files are supported.";
      this.formSubmitted = false;
      return;
    }
    const formData = new FormData();

    formData.append('file', files[0]);
    //formData.append('pos_type', this.f.ad_position.value);

    this.newsService.uploadFileValidation(formData).pipe()
      .subscribe((res:any) => {
        this.formSubmitted = false;
        if (res.data) {
          this.imgURL = res.data.image_path;
          this.imgName = res.data.file_name;
        }
      }, err => {
        let errorMessage = '';
        this.newNewsForm.controls['adv_image'].setValue('');
        this.toastr.error(errorMessage || err.error.message || 'Some error occurred while creating new Advertisment.');
        this.formSubmitted = false;
      });
  }

  onSubmit() {
    this.submitted = true;
    if (this.newNewsForm.invalid) {
      return;
    }
    else{
    const forminputdata = {
      title:this.f.title.value,
      news_id:this.news.news_id,
      isFeatured: this.f.isFeatured.value,
      newsDescription: this.f.newsDescription.value,
      videoURL: this.f.videoURL.value,
      image_name:this.imgName,
      publicationDate: moment(this.f.publicationDate.value).format('YYYY-MM-DD HH:mm'),
    };
 
    this.formSubmitted = true;

    this.newsService.updateNews(forminputdata).pipe()
      .subscribe((res:any) => {
        this.formSubmitted = false;
        this.getNewsDetailById();
        if (res) {
          this.toastr.success( res.message || 'News Update Sucessfully.');
          this.router.navigate(['/news']);
          
        }
      }, err => {
        let errorMessage = '';
        this.toastr.error(errorMessage || err.error.GlobalError || 'Some error occurred while creating new News.');
        this.formSubmitted = false;
      });
    }
  }

  handleReset() {
    this.newNewsForm.reset();
    this.submitted = false;
    this.formSubmitted = false;
    this.imgURL = '';
    this.imgPath ='';
    this.imgName='';
    //this.newNewsForm.controls['ad_position'].setValue('');


  }

}
