import { CatalogueEntry, categoryChips, closestFirst, essentialsFirst, isEssential, roleMismatch, searchCatalogue } from './catalogue';

const file: CatalogueEntry = { name: 'file', title: 'File', description: 'Read and write files.', label: 'file,core' };
const sftp: CatalogueEntry = { name: 'sftp', title: 'SFTP', description: 'Upload and download files to/from SFTP servers.', label: 'file' };
const kafka: CatalogueEntry = {
  name: 'kafka',
  title: 'Kafka',
  description: 'Send and receive messages to/from an Apache Kafka broker.',
  label: 'messaging',
};
const timer: CatalogueEntry = {
  name: 'timer',
  title: 'Timer',
  description: 'Generate messages in specified intervals.',
  label: 'core,scheduling',
  consumerOnly: true,
};
const log: CatalogueEntry = {
  name: 'log',
  title: 'Log',
  description: 'Prints data to the log.',
  label: 'core,monitoring',
  producerOnly: true,
};
const plain: CatalogueEntry = { name: 'custom' };

describe('Camel catalogue', () => {
  describe('category chips', () => {
    it('counts each component under every label it has, largest category first', () => {
      const { shown } = categoryChips([file, sftp, kafka, timer, log, plain], 10);

      expect(shown).toEqual([
        { label: 'core', count: 3 },
        { label: 'file', count: 2 },
        { label: 'messaging', count: 1 },
        { label: 'monitoring', count: 1 },
        { label: 'scheduling', count: 1 },
      ]);
    });

    it('puts the long tail behind More', () => {
      const { shown, more } = categoryChips([file, sftp, kafka, timer, log], 2);

      expect(shown.map(chip => chip.label)).toEqual(['core', 'file']);
      expect(more.map(chip => chip.label)).toEqual(['messaging', 'monitoring', 'scheduling']);
    });
  });

  describe('role filtering', () => {
    it('lets a component that can receive messages be a Source', () => {
      expect(roleMismatch(timer, 'consumer')).toBeNull();
      expect(roleMismatch(file, 'consumer')).toBeNull();
    });

    it('keeps a component that can only send messages out of the Source', () => {
      expect(roleMismatch(log, 'consumer')).toBe('Log can only send messages, so it can only be an Action or Sink.');
    });

    it('keeps a component that can only receive messages out of Actions and Sinks', () => {
      expect(roleMismatch(timer, 'producer')).toBe('Timer can only receive messages, so it can only be a Source.');
      expect(roleMismatch(log, 'producer')).toBeNull();
    });
  });

  describe('search', () => {
    it('finds components by title, id and description, closest match first', () => {
      expect(searchCatalogue([kafka, file, sftp], 'file').map(entry => entry.name)).toEqual(['file', 'sftp']);
      expect(searchCatalogue([kafka, file, sftp], 'Apache').map(entry => entry.name)).toEqual(['kafka']);
      expect(searchCatalogue([kafka, file, sftp], 'SFTP').map(entry => entry.name)).toEqual(['sftp']);
    });

    it('puts an exact or closest id or title on top, above components that only mention it', () => {
      const filter: CatalogueEntry = { name: 'filter', title: 'Filter', description: 'Only lets matching messages through.' };
      const ftp: CatalogueEntry = { name: 'ftp', title: 'FTP', description: 'Upload and download files to/from FTP servers.' };
      expect(searchCatalogue([sftp, filter, ftp, file], 'file').map(entry => entry.name)).toEqual(['file', 'sftp', 'ftp']);
      expect(searchCatalogue([sftp, filter, ftp, file], 'fil ').map(entry => entry.name)).toEqual(['file', 'filter', 'sftp', 'ftp']);
    });

    it('keeps entries that do not match at the end when only sorting', () => {
      expect(closestFirst([kafka, sftp, file], 'file').map(entry => entry.name)).toEqual(['file', 'sftp', 'kafka']);
    });

    it('lists everything for an empty search', () => {
      expect(searchCatalogue([kafka, file], ' ')).toEqual([kafka, file]);
    });
  });

  describe('Essentials', () => {
    const setbody: CatalogueEntry = { name: 'setbody', title: 'Set body', action: true, source: false, sink: false };
    const amazonmq: CatalogueEntry = { name: 'amazonmq', title: 'Amazon MQ', action: true, source: true, sink: true };
    const get: CatalogueEntry = { name: 'get', title: 'GET', action: true, source: true, sink: true };

    it("counts Assimbly's own Actions that work on the message, not the ones that talk to another system", () => {
      expect([setbody, amazonmq, get, file].filter(isEssential)).toEqual([setbody]);
    });

    it('lists the Essentials first and keeps the order of the rest', () => {
      expect(essentialsFirst([file, kafka, setbody])).toEqual([setbody, file, kafka]);
    });
  });
});
