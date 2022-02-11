/**
 * Angular bootstrap Date adapter
 */
import { Injectable } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';

@Injectable()
export class NgbDateMomentAdapter extends NgbDateAdapter<moment.Moment> {
  fromModel(date: moment.Moment): NgbDateStruct {
    if (date && moment.isMoment(date) && date.isValid()) {
      return { year: date.year(), month: date.month() + 1, day: date.date() };
    }
    // ! can be removed after https://github.com/ng-bootstrap/ng-bootstrap/issues/1544 is resolved
    return null!;
  }

  toModel(date: NgbDateStruct): moment.Moment {
    // ! after null can be removed after https://github.com/ng-bootstrap/ng-bootstrap/issues/1544 is resolved
    return date ? moment(date.year + '-' + date.month + '-' + date.day, 'YYYY-MM-DD') : null!;
  }
}
