import { apiStatus } from './api-status';

describe('API status', () => {
  it('summarises the Flow statuses of the Handler Flows, with Drafts counted apart', () => {
    expect(
      apiStatus([
        { status: 'active', draft: false },
        { status: 'active', draft: false },
        { status: 'inactiveError', draft: false },
        { status: 'inactive', draft: true },
      ]),
    ).toEqual({ running: 2, total: 4, errors: 1, drafts: 1, label: '2 of 4 Operations running, 1 Error, 1 Draft', tone: 'failed' });
  });

  it('is running when every Operation runs, and stopped otherwise', () => {
    expect(apiStatus([{ status: 'active', draft: false }])).toMatchObject({ label: '1 of 1 Operation running', tone: 'started' });
    expect(
      apiStatus([
        { status: 'inactive', draft: false },
        { status: 'paused', draft: false },
      ]),
    ).toMatchObject({ label: '0 of 2 Operations running', tone: 'default' });
    expect(apiStatus([])).toMatchObject({ label: 'No Operations yet', tone: 'default' });
  });
});
