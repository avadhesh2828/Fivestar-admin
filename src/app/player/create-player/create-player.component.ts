import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';

import { PlayerService } from '../../services/Player.service';
import { EventService } from '../../services/event.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { formatDateTime, formatDate } from '../../services/utils.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-player-create',
  templateUrl: './create-player.component.html',
  styleUrls: ['./create-player.component.scss']
})
export class CreatePlayerComponent implements OnInit {

  public playerForm: FormGroup;
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
  public promotion:[];
  public fighterStatus:[];

  constructor(
    private playerService: PlayerService, private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router,
    private eventService: EventService,
  ) { }

  ngOnInit() {
    const string_reg = '[a-zA-Z ]*';
    const number_ref = '/^-?[\d.]+(?:e-?\d+)?$/';
    this.playerForm = this.formBuilder.group({
      first_name:['',   [Validators.required, Validators.minLength(1),Validators.maxLength(30), Validators.pattern(string_reg)]],
      last_name:['',   [Validators.required, Validators.minLength(4),Validators.maxLength(30),Validators.pattern(string_reg)]],
      nick_name:['',   [Validators.pattern(string_reg)]],
      team_name: ['',   [Validators.required]],
      gym: ['',   [Validators.required]],
      promotion_id: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      stance: ['',   [Validators.required,Validators.minLength(4),Validators.maxLength(30),Validators.pattern(string_reg)]],
      win: ['',   [Validators.required]],
      loss: ['',   [Validators.required]],
      draw: ['',   [Validators.required]],
      ko: ['',  ''],
      submission: ['',   ''],
      weight: ['',   [Validators.required]],
      height_feet: ['',   [Validators.required]],
      height_inch: ['',   [Validators.required]],
      dob: ['',   [Validators.required]],
      player_image:['',[Validators.required]],
      bio:['',[]],
      fighterStatus:['',[Validators.required]],
    });
    this.minDate = new Date(2005,1,24);
    this.getPromotion();
    this.getAllPlayer();
    // this.getStateList();
  }

  initLink(){
    return this.formBuilder.group({
        consolationPrize: ['']
    });
  }

  // getting form control values
  get f() {
    return this.playerForm.controls;
  }

  getPromotion(){
    this.eventService.getPromotion({}).pipe()
      .subscribe((pro: any) => {
        this.promotion = pro.data;
      }, (err: any) => {
        this.promotion = [];
        this.toastr.error(err.error.global_error || 'There was an error.');
      });
  }
  getAllPlayer(){
    this.playerService.getAllFighterStatus({}).pipe()
      .subscribe((sta: any) => {
        this.fighterStatus = sta.data;
      }, (err: any) => {
        this.fighterStatus = [];
        this.toastr.error(err.error.global_error || 'There was an error.');
      });
  }

  //previow of image before upload
  preview(files) {
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

    this.playerService.uploadFileValidation(formData).pipe()
      .subscribe((res:any) => {
        this.formSubmitted = false;
        if (res.data) {
          this.imgURL = res.data.image_path;
          this.imgName = res.data.file_name;
        }
      }, err => {
        let errorMessage = '';
        this.playerForm.controls['player_image'].setValue('');
        this.toastr.error(errorMessage || err.error.message || 'Some error occurred while creating new Advertisment.');
        this.formSubmitted = false;
      });
  }

  onSubmit() {
    this.submitted = true;
    if (this.playerForm.invalid) {
      return;
    }
    else{
    const formInputData = {
      first_name:this.f.first_name.value,
      last_name:this.f.last_name.value,
      nick_name:this.f.nick_name.value,
      team_name:this.f.team_name.value,
      promotion_id:this.f.promotion_id.value,
      gender:this.f.gender.value,
      gym:this.f.gym.value,
      stance:this.f.stance.value,
      dob:this.f.dob.value,
      win:this.f.win.value,
      loss:this.f.loss.value,
      draw:this.f.draw.value,
      ko:this.f.ko.value,
      submission:this.f.submission.value,
      weight:this.f.weight.value,
      height_feet:this.f.height_feet.value,
      height_inch:this.f.height_inch.value,
      player_image:this.imgName,
      bio:this.f.bio.value,
      player_status:this.f.fighterStatus.value,
    };
 
    this.formSubmitted = true;

    this.playerService.createPlayer(formInputData).pipe()
      .subscribe((res:any) => {
        this.formSubmitted = false;
        if (res) {
          this.toastr.success( res.message || 'New Player Created Successfully.');
          this.handleReset();
          
        }
      }, err => {
        let errorMessage = '';
        this.toastr.error(errorMessage || err.error.GlobalError || 'Some error occurred while creating new Player.');
        this.formSubmitted = false;
      });
    }
  }

  handleReset() {
    this.playerForm.reset();
    this.submitted = false;
    this.formSubmitted = false;
    this.imgURL = '';
    this.imgPath ='';
    this.imgName='';
    //this.playerForm.controls['ad_position'].setValue('');


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
