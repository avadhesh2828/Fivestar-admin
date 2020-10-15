import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';

import { PagesContentService } from '../../services/pageContent.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from '../../shared/loader/loader.service';
import { environment } from '../../../environments/environment';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-page-edit-details',
  templateUrl: './page-edit-details.component.html',
  styleUrls: ['./page-edit-details.component.scss']
})
export class PageEditDetailsComponent implements OnInit {

  public pageContentForm: FormGroup;
  formSubmitted = false;
  formError: any;
  submitted = false;
  maxChars = 200;
  remainChars:any ='';
  public error = false;
  public message: string;
  public pageContent:any;
  public Editor = ClassicEditor;
  


  constructor(
    private pagesContentService: PagesContentService, private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    
    this.editPageContent();
    this.pageContentForm = this.formBuilder.group({
      page_title:['',   [Validators.required, Validators.minLength(2),Validators.maxLength(30)]],
      page_description: ['',   [Validators.required]],
    });
  }

  private editPageContent() {
    this.loaderService.display(true);
    const id = this.route.snapshot.paramMap.get('pageContentId');
    const data = {
      page_content_id:id,
    };
    this.pagesContentService.editPageContent(data)
      .subscribe((res) => {
        this.loaderService.display(false);
        if (res['data']) {
          this.pageContent = res['data'];
          //this.oldUserName = this.user['user_name'];
        }
      }, (err: object) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }
  get f() {
    return this.pageContentForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.pageContentForm.invalid) {
      return;
    }
    else{
    const forminputdata = {
      page_title:this.f.page_title.value,
      page_content_id:this.pageContent.page_content_id,
      page_description: this.f.page_description.value,
    };
 
    this.formSubmitted = true;

    this.pagesContentService.updatePageContent(forminputdata).pipe()
      .subscribe((res:any) => {
        this.formSubmitted = false;
        if (res) {
          this.toastr.success( res.message || 'Page Content Update Sucessfully.');
          this.router.navigate(['/pages-list']);
          
        }
      }, err => {
        let errorMessage = '';
        this.toastr.error(errorMessage || err.error.GlobalError || 'Some error occurred while updating page content.');
        this.formSubmitted = false;
      });
    }
  }

  handleReset() {
    this.pageContentForm.reset();
    this.submitted = false;
    this.formSubmitted = false;
    //this.pageContentForm.controls['ad_position'].setValue('');


  }

}

