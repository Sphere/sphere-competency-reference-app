import { CardService } from './card.service';
import * as _ from 'lodash-es';
import { async } from '@angular/core/testing';


jest.mock('lodash-es', () => ({
  forEach: jest.fn((data, iteratee) => data.forEach(iteratee)),
  forIn: jest.fn((obj, iteratee) => Object.entries(obj).forEach(([key, value]) => iteratee(value, key))),
  pick: jest.fn((obj, keys) => {
    const result = {};
    keys.forEach((key) => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }),
  zipObjectDeep: jest.fn((keys, values) => keys.reduce((res, key, idx) => {
    res[key] = values[idx];
    return res;
  }, {})),
  merge: jest.fn((target, source) => Object.assign(target, source)),
}));


describe('CardService', () => {
  let service: CardService;

  beforeEach(() => {
    service = new CardService();
  });

  describe('getDataForCard', () => {
      // Transforms input data array into list of card objects with basic properties
      it('should transform input data into card objects with basic properties when valid data provided', () => {
        const service = new CardService();
  
        const inputData = [{
          name: 'Test Card',
          appIcon: 'test-icon',
          thumbnail: 'test-thumb',
          identifier: 'test-id',
          competencies_v1: JSON.stringify([{
            competencyName: 'Test Comp',
            level: 3
          }])
        }];
  
        const staticData = {
          bottom: {
            isVisible: false
          }
        };
        const dynamicFields = {
          testField: ['testValue']
        };
  
        const metaData = {
          meta: ['name']
        };
  
        const result = service.getDataForCard(inputData, staticData, dynamicFields, metaData);
  
        expect(result.length).toBe(1);
        expect(result[0].name).toBe('Test Card');
        expect(result[0].appIcon).toBe('test-icon');
        expect(result[0].thumbnail).toBe('test-thumb');
        expect(result[0].identifier).toBe('test-id');
        expect(result[0].cometencyData[0].name).toBe('Test Comp');
        expect(result[0].cometencyData[0].levels).toBe(' Level 3');
      });
    it('should handle empty input data gracefully', () => {
      const result = service.getDataForCard([], {}, {}, {});
      expect(result).toEqual([]);
    });

    it('should handle items without competencies_v1 gracefully', () => {
      const inputData = [
        {
          name: 'Test Card',
          appIcon: 'test-icon',
          thumbnail: 'test-thumb',
          identifier: 'test-123',
        },
      ];

      const result = service.getDataForCard(inputData, {}, {}, {});
      expect(result[0]).toEqual(
        expect.objectContaining({
          name: 'Test Card',
          appIcon: 'test-icon',
          thumbnail: 'test-thumb',
          identifier: 'test-123',
          cometencyData: [],
        })
      );
    });
    
  });
});
