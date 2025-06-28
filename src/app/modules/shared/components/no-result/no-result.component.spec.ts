 // Component initializes with default 'No result found' message when no data is provided
 import { Component, Input } from '@angular/core';
 import * as _ from 'lodash';
 import { NoResultComponent } from './no-result.component';

describe('NoResultComponent', () => {
  it('should initialize with default message when no data is provided', () => {
    const component = new NoResultComponent();
    component.ngOnInit();
    expect(component.message).toBe(' No result found');
  });
  it('should display custom message when data.message is provided', () => {
    const component = new NoResultComponent();
    component.data = { message: 'Custom Message' };
    component.ngOnInit();
    expect(component.message).toBe('Custom Message');
  });
  it('should call setMessage when ngOnInit is called', () => {
    const component = new NoResultComponent();
    const setMessageSpy = jest.spyOn(component, 'setMessage');
    component.ngOnInit();
    expect(setMessageSpy).toHaveBeenCalled();
  });
});
   

    