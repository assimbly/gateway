import { StepType } from 'app/shared/model/step.model';

import { automaticErrorHandlerPath, defaultErrorHandlerStep, errorHandlerPathOnSave } from './error-handler';

describe('Error Handler', () => {
  it('logs a failed message at level ERROR with all its details by default', () => {
    expect(defaultErrorHandlerStep()).toMatchObject({
      stepType: StepType.ERROR,
      componentType: 'log',
      uri: '',
      options: 'level=ERROR&showAll=true',
    });
  });

  it('logs to FlowName/FlowID once the Flow is saved', () => {
    expect(errorHandlerPathOnSave({ componentType: 'log', uri: '' }, { name: 'Orders', id: 12 }, null)).toBe('Orders/12');
  });

  it('follows a rename while the path is still the default', () => {
    expect(errorHandlerPathOnSave({ componentType: 'log', uri: 'Orders/12' }, { name: 'Orders to SFTP', id: 12 }, 'Orders')).toBe(
      'Orders to SFTP/12',
    );
  });

  it('keeps a path the user chose', () => {
    expect(errorHandlerPathOnSave({ componentType: 'log', uri: 'audit' }, { name: 'Orders', id: 12 }, 'Orders')).toBe('audit');
  });

  it('keeps the path of an Error Handler with another Component', () => {
    expect(errorHandlerPathOnSave({ componentType: 'file', uri: '' }, { name: 'Orders', id: 12 }, null)).toBe('');
  });

  it('shows the automatic path while editing, with FlowID until the Flow is saved', () => {
    expect(automaticErrorHandlerPath({ componentType: 'log', uri: '' }, { name: 'Orders', id: null }, null)).toBe('Orders/FlowID');
    expect(automaticErrorHandlerPath({ componentType: 'log', uri: '' }, { name: '', id: null }, null)).toBe('FlowName/FlowID');
    expect(automaticErrorHandlerPath({ componentType: 'log', uri: 'Orders/12' }, { name: 'Orders v2', id: 12 }, 'Orders')).toBe('Orders v2/12');
  });

  it('shows no automatic path once the user chose one', () => {
    expect(automaticErrorHandlerPath({ componentType: 'log', uri: 'audit' }, { name: 'Orders', id: 12 }, 'Orders')).toBeUndefined();
    expect(automaticErrorHandlerPath({ componentType: 'file', uri: '' }, { name: 'Orders', id: 12 }, 'Orders')).toBeUndefined();
  });
});
