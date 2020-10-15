import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';

import { AdvertisementService } from '../../services/advertisement.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { formatDateTime, formatDate } from '../../services/utils.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
@Component({
  selector: 'app-adv-new',
  templateUrl: './adv-new.component.html',
  styleUrls: ['./adv-new.component.scss']
})
export class AdvNewComponent implements OnInit {

  public newAdvForm: FormGroup;
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

  constructor(
    private advService: AdvertisementService, private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
    this.newAdvForm = this.formBuilder.group({
      advName:['',   [Validators.required, Validators.minLength(4),Validators.maxLength(30)]],
      target_url:['',   [Validators.required,Validators.pattern(reg)]],
      ad_position: ['',   [Validators.required]],
      adv_image:['',[Validators.required]],
    });
    this.getAdvPositions();
    this.minDate = new Date();
    // this.getStateList();
  }

  public getAdvPositions() {
    this.advService.getAllAdvPositions({})
      .subscribe((response: any) => {
        this.advPositionList = response.data;
      }, (err: Error) => {
        this.toastr.error(err.message || 'There was an error.');
        this.error = true;
      });
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
    return this.newAdvForm.controls;
  }

  //previow of image before upload
  preview(files) {
    if(!this.f.ad_position.value){
      this.toastr.error('Please select Advertisement position first.');  
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
    formData.append('pos_type', this.f.ad_position.value);

    this.advService.uploadFileValidation(formData).pipe()
      .subscribe((res:any) => {
        this.formSubmitted = false;
        if (res.data) {
          this.imgURL = res.data.image_path;
          this.imgName = res.data.file_name;
        }
      }, err => {
        let errorMessage = '';
        this.newAdvForm.controls['adv_image'].setValue('');
        this.toastr.error(errorMessage || err.error.message || 'Some error occurred while creating new Advertisment.');
        this.formSubmitted = false;
      });
  }

  onSubmit() {
    this.submitted = true;
    if (this.newAdvForm.invalid) {
      return;
    }
    else{
    const forminputdata = {
      name:this.f.advName.value,
      target_url:this.f.target_url.value,
      position_type: this.f.ad_position.value,
      image_name:this.imgName,
    };
 
    this.formSubmitted = true;

    this.advService.createAdv(forminputdata).pipe()
      .subscribe((res:any) => {
        this.formSubmitted = false;
        if (res) {
          this.toastr.success( res.message || 'New Advertisement Created Sucessfully.');
          this.handleReset();
          
        }
      }, err => {
        let errorMessage = '';
        this.toastr.error(errorMessage || err.error.GlobalError || 'Some error occurred while creating new Advertisment.');
        this.formSubmitted = false;
      });
    }
  }

  handleReset() {
    this.newAdvForm.reset();
    this.submitted = false;
    this.formSubmitted = false;
    this.imgURL = '';
    this.imgPath ='';
    this.imgName='';
    this.newAdvForm.controls['ad_position'].setValue('');


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
