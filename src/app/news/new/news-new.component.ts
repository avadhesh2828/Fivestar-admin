import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import * as moment from 'moment';
import { NewsService } from '../../services/news.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { formatDateTime, formatDate } from '../../services/utils.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-news-new',
  templateUrl: './news-new.component.html',
  styleUrls: ['./news-new.component.scss']
})
export class NewsNewComponent implements OnInit {
  public newNewsForm: FormGroup;
  formSubmitted = false;
  formError: any;
  submitted = false;
  maxChars = 200;
  remainChars:any ='';
  public error = false;
  //minDate: Date;
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
  public isFeatured = 1;
  public winner = "red_winner";
  //public minDate = new Date();

  constructor(
    private newsService: NewsService, private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    const youtube_reg = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    this.newNewsForm = this.formBuilder.group({
      title:['',   [Validators.required, Validators.minLength(4),Validators.maxLength(30)]],
      isFeatured:['',   [Validators.required]],
      newsDescription: ['',   [Validators.required]],
      videoURL: ['', Validators.pattern(youtube_reg)],
      publicationDate:['',[Validators.required]],
      adv_image:['',[Validators.required]],
    });
    //this.minDate = new Date();
  }

  formatDate(date) {
    return moment(date).format('YYYY-MM-DD');
  }

  public getImageRatio(){
    const obj = this.advPositionList.filter(adv => adv.ad_position_id == this.f['ad_position'].value)[0];
    this.currentPosition =  '(' + obj.width + 'x' + obj.height + ')';
  }

  initLink(){
    return this.formBuilder.group({
        consolationPrize: ['']
    });
  }

  // getting form control values
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
      //target_url:this.f.target_url.value,
      isFeatured: this.f.isFeatured.value,
      newsDescription: this.f.newsDescription.value,
      videoURL: this.f.videoURL.value,
      image_name:this.imgName,
      publicationDate: moment(this.f.publicationDate.value).format('YYYY-MM-DD HH:mm'),
    };
 
    this.formSubmitted = true;

    this.newsService.createNews(forminputdata).pipe()
      .subscribe((res:any) => {
        this.formSubmitted = false;
        if (res) {
          this.toastr.success( res.message || 'Add News Created Sucessfully.');
          this.handleReset();
          
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

    fileChangeEvent(event: any): void {
        this.imgURL = event.target.value;
        /*this.imageChangedEvent = event;*/
    }
    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
    }
    imageLoaded() {
        // show cropper
    }
    cropperReady() {
        // cropper ready
    }
    loadImageFailed() {
        // show message
    }

}
