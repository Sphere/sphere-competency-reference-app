import { Injectable } from '@angular/core';
import * as _ from 'lodash-es';
@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor() { }
  getDataForCard(data, staticData, dynamicFields, metaData, showStarButton?: any, showMenuVert?:any) {
    const list: Array<any> = [];
    _.forEach(data, (item, key) => {
      const card = {
        name: item.name,
        appIcon: item.appIcon,
        thumbnail: item.thumbnail,
        identifier: item.identifier,
        cometencyData: []
      };
      if (item.competencies_v1 && Object.keys(item.competencies_v1).length > 0) {
        _.forEach(JSON.parse(item.competencies_v1), (value: any) => {
          if (value.level) {
            card.cometencyData.push(
              {
                name: value.competencyName,
                levels: ` Level ${value.level}`
              }
            )
          }
        })
      }
      _.forIn(staticData, (value, key1) => {
        if (showStarButton && value.bottom) {
          value.bottom.isVisisble = true;
        }
        if(showMenuVert  &&  value.right){
          value.right.isVisisble = true;
        }
        card[key1] = value;
      });

      _.forIn(metaData, (value, key1) => {
        card[key1] = _.pick(item, value);
      });
      _.forIn(dynamicFields, (fieldData, fieldName) => {
        const value = _.pick(item, fieldData);
        _.forIn(value, (val1, key1) => {
          const name = _.zipObjectDeep([fieldName], [val1]);
          _.forIn(name, (values, index) => {
            card[index] = _.merge(name[index], card[index]);
          });
        });
      });
      list.push(card);
    });
    console.log(list)
    return <any[]>list;
  }
  getOfflineDataForCard(data, staticData, dynamicFields, metaData, showStarButton?: any, showMenuVert?:any,showVideoIcon?:any) {
    const list: Array<any> = [];
    _.forEach(data, (item, key) => {
      const card = {
        name: item.contentData.name,
        appIcon: item.contentData.appIcon,
        thumbnail: item.contentData.thumbnail,
        identifier: item.contentData.identifier,
        description: item.contentData.description,
        instructions: item.contentData.instructions,
        childNodes: item.contentData.childNodes,
        contentType: item.contentData.contentType,
        mimeType: item.contentData.mimeType,
        primaryCategory: item.contentData.primaryCategory,
        gatingEnabled: item.contentData.gatingEnabled,
        issueCertification: item.contentData.issueCertification,
        duration: item.contentData.duration,
        lastPublishedOn: item.contentData.lastPublishedOn,
        creator:item.contentData.creator,
        competencies_v1: item.contentData.competencies_v1,
        children:[],
        cometencyData: [],
      };
      if (item.contentData.competencies_v1 && Object.keys(item.contentData.competencies_v1).length > 0) {
        _.forEach(JSON.parse(item.contentData.competencies_v1), (value: any) => {
          if (value.level) {
            card.cometencyData.push(
              {
                name: value.competencyName,
                levels: ` Level ${value.level}`
              }
            )
          }
        })
      }
      _.forIn(staticData, (value, key1) => {
        if (showStarButton && value.bottom) {
          value.bottom.isVisisble = true;
        }
        if(showMenuVert  && value.right){
          value.right.isVisisble = true;
        }
        if(showVideoIcon  && value.center){
          value.center.isVisisble = true;
        }
        card[key1] = value;
      });

      _.forIn(metaData, (value, key1) => {
        card[key1] = _.pick(item.contentData, value);
      });
      _.forIn(dynamicFields, (fieldData, fieldName) => {
        const value = _.pick(item.contentData, fieldData);
        _.forIn(value, (val1, key1) => {
          const name = _.zipObjectDeep([fieldName], [val1]);
          _.forIn(name, (values, index) => {
            card[index] = _.merge(name[index], card[index]);
          });
        });
      });
      list.push(card);
    });
    console.log(list)
    return <any[]>list;
  }
}


