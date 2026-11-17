import { saveAs } from './save-as';

describe('saveAs', () => {
  let click: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    URL.createObjectURL = jest.fn(() => 'blob:http://localhost/1');
    URL.revokeObjectURL = jest.fn();
    click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  });

  afterEach(() => {
    click.mockRestore();
    jest.useRealTimers();
  });

  it('downloads the Blob under the file name', () => {
    const blob = new Blob(['<flow/>'], { type: 'application/xml' });

    saveAs(blob, 'export_flow.xml');

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(link.href).toBe('blob:http://localhost/1');
    expect(link.download).toBe('export_flow.xml');
  });

  it('revokes the Blob URL only after the download had time to start', () => {
    saveAs(new Blob(['x']), 'x.txt');

    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/1');
  });
});
