import { totalAddresses } from './address-filter';

describe('totalAddresses', () => {
  it('adds up the Consumers and Messages of every Queue or Topic', () => {
    expect(
      totalAddresses([
        { name: 'orders', numberOfConsumers: 2, numberOfMessages: 10 },
        { name: 'invoices', numberOfConsumers: 1, numberOfMessages: 1500 },
      ]),
    ).toEqual({ consumers: 3, messages: 1510 });
  });

  it('counts a missing number as 0', () => {
    expect(totalAddresses([{ name: 'orders' }, { name: 'invoices', numberOfMessages: 4 }])).toEqual({ consumers: 0, messages: 4 });
  });

  it('gives 0 for no list at all', () => {
    expect(totalAddresses(undefined)).toEqual({ consumers: 0, messages: 0 });
  });
});
