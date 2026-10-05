import { CatalogueEntry, categoryChips, roleMismatch, searchCatalogue } from './catalogue';

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

    it('lists everything for an empty search', () => {
      expect(searchCatalogue([kafka, file], ' ')).toEqual([kafka, file]);
    });
  });
});
