import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { AccountService } from 'app/core/auth/account.service';
import { AlertService } from 'app/core/util/alert.service';
import { Address, IRootQueueAddress } from 'app/shared/model/address.model';
import { QueueComponent } from './queue.component';
import { QueueService } from './queue.service';

describe('QueueComponent', () => {
  const queue = (name: string, temporary = false): Address => ({ name, temporary, numberOfConsumers: 0, numberOfMessages: 0 }) as Address;

  let brokerQueues: Address[];

  function create(): QueueComponent {
    TestBed.configureTestingModule({
      imports: [QueueComponent],
      providers: [
        {
          provide: QueueService,
          useValue: {
            getAllQueues: () => of(new HttpResponse<IRootQueueAddress>({ body: { queues: { queue: brokerQueues } } })),
          },
        },
        { provide: AccountService, useValue: { identity: () => of(null) } },
        { provide: AlertService, useValue: {} },
      ],
    });
    const component = TestBed.createComponent(QueueComponent).componentInstance;
    component.isBroker.set(true);
    component.brokerType.set('classic');
    return component;
  }

  it('drops a Queue from the list on refresh once the Broker no longer has it', () => {
    const component = create();
    component.addresses.set([queue('Dummy'), queue('orders')]);
    brokerQueues = [queue('orders')];

    component.updateAllQueues();

    expect(component.addresses().map(address => address.name)).toEqual(['orders']);
  });

  it('leaves temporary Queues out on refresh', () => {
    const component = create();
    brokerQueues = [queue('temp-reply', true), queue('orders')];

    component.updateAllQueues();

    expect(component.addresses().map(address => address.name)).toEqual(['orders']);
  });
});
