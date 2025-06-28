import { HttpClient } from '@angular/common/http';
import { Directive, ElementRef, HostBinding, HostListener, Input, OnChanges } from '@angular/core';
// import { ImgCacheService } from 'imgcache.js';
import { Storage } from "@ionic/storage";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Directive({
  selector: '[appImageCache]'
})
export class ImageCacheDirective implements OnChanges{

  @Input() src = '';
  @HostBinding('src') srcUrl:SafeResourceUrl | string = ''
  @HostListener('error') async updateSrc() {
    this.srcUrl = await this.getImage();
  }

  constructor(
    private http: HttpClient, 
    private storage: Storage,
    private sanitizer: DomSanitizer
  ) { 
  }

  ngOnChanges() {
    if (this.src) {
      this.srcUrl = this.src;
      if(navigator.onLine){
        this.saveImage();
      }
    }
  }

  saveImage(){
    this.http.get(this.src, { responseType: 'blob' }).subscribe(
      (imageData) => {
        if(imageData){
          //const dataURL:string = URL.createObjectURL(imageData);
          // Store the image data in the cache
          this.storage.set(this.src, imageData).then(() => {
            // console.log('cache path-',dataURL);
          });
        }
      },      
    );
  }

  async getImage():Promise<SafeResourceUrl>{
    return new Promise(async (resolve, reject) => {
      const cachedImageData = await this.storage.get(this.src);
      if(cachedImageData){
        const dataURL:string = URL.createObjectURL(cachedImageData);
        let path:SafeResourceUrl = await this.sanitizer.bypassSecurityTrustResourceUrl(dataURL);
        console.log('SafeResourceUrl---', path);
        resolve(path);
      }else{
        resolve('');
      }
    });
  }

}

// https://gist.github.com/ozexpert/d95677e1fe044e6173ef59840c9c484e