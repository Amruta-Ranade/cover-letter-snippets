import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { DatabaseService } from "./database.service";
import { StatusMessageService} from './status-message.service';

@Injectable()
export class ParseDescriptionService {

  jobDescription:string = "";
  showParsingResults:boolean = false;
  keywordArray:Array<{}>;

  constructor(private databaseService:DatabaseService, private statusMessageService:StatusMessageService) { }

  parseDescription(description):any {
    this.resetJobKeywords();
    this.jobDescription = description;

    let descriptionWords = description.split(/\W/);

    for(let i = 0; i < descriptionWords.length; i++) {
      let word = descriptionWords[i].toLowerCase();
      if(word in this.databaseService.categories) {
        this.databaseService.categories[word].jobKeywords++;
      }
    }

    this.keywordArray = this.createOrderedArray();
    this.showParsingResults = true;
  }

  resetJobKeywords():void {
    let keywords = Object.keys(this.databaseService.categories);
    for(let i = 0; i< keywords.length; i++) {
      this.databaseService.categories[keywords[i]].jobKeywords = 0;
    }
  }

  createOrderedArray():Array<{}> {
    let keywords = Object.keys(this.databaseService.categories);
    let keywordsArray = [];
    for (let i = 0; i < keywords.length; i++) {
      this.databaseService.categories[keywords[i]].keyword = keywords[i];
      keywordsArray.push(this.databaseService.categories[keywords[i]]);
    }

    function quicksortByJobKeywords(arr, left, right) {
      if (left < right) {
        let divider = divide(arr, left, right);
        quicksortByJobKeywords(arr, left, divider-1);
        quicksortByJobKeywords(arr, divider+1, right);
      }
      return arr;
    }

    function divide(arr,left,right) {
      let dividerIndex = left;
      let pivot = right;

      for(let i = left; i < right; i++) {
        if (arr[i].jobKeywords > arr[pivot].jobKeywords) {
          swap(arr, i, dividerIndex);
          dividerIndex++;
        }
      }
      swap(arr, pivot, dividerIndex);
      return dividerIndex;
    }

    function swap(arr, a, b) {
      let temp = arr[a];
      arr[a] = arr[b];
      arr[b] = temp;
    }

    quicksortByJobKeywords(keywordsArray, 0, keywordsArray.length-1);
    let statusMessage = "Finished parsing the description. The category with the most keywords in this job description is: "+keywordsArray[0].keyword + " with "+keywordsArray[0].jobKeywords + " keywords.";
    this.statusMessageService.newStatusMessage(statusMessage, "success");
    return keywordsArray;
  }

}
