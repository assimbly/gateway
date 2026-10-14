import { baseName, escapeHtml, flowInExport, languageOfFile, readText, xmlProblem } from './import-files';

const flowExport = `<?xml version="1.0" encoding="UTF-8"?>
<dil>
  <integrations>
    <integration>
      <id>1</id>
      <flows>
        <flow>
          <id>12</id>
          <name>Orders to SFTP</name>
        </flow>
      </flows>
    </integration>
  </integrations>
</dil>`;

const flowJson = `{
  "dil": {
    "integrations": {
      "integration": {
        "id": "1",
        "flows": {
          "flow": { "id": "12", "name": "Orders to SFTP" }
        }
      }
    }
  }
}`;

describe('Import files', () => {
  describe('languageOfFile', () => {
    it.each([
      ['job.groovy', 'groovy'],
      ['job.GVY', 'groovy'],
      ['job.py', 'python'],
      ['job.js', 'javascript'],
      ['job.mjs', 'javascript'],
      ['map.jslt', 'jslt'],
      ['map.xsl', 'xslt'],
      ['map.xslt', 'xslt'],
    ])('suggests %s is %s', (fileName, language) => {
      expect(languageOfFile(fileName)).toBe(language);
    });

    it.each(['notes.txt', 'job', 'job.'])('suggests no language for %s', fileName => {
      expect(languageOfFile(fileName)).toBeUndefined();
    });
  });

  it('escapes text for an alert', () => {
    expect(escapeHtml('<route id="a"> & <b>')).toBe('&lt;route id="a"&gt; &amp; &lt;b&gt;');
  });

  describe('baseName', () => {
    it.each([
      ['export_orders.xml', 'export_orders'],
      ['nightly.job.groovy', 'nightly.job'],
      ['noextension', 'noextension'],
      ['.hidden', '.hidden'],
    ])('names %s %s', (fileName, expected) => {
      expect(baseName(fileName)).toBe(expected);
    });
  });

  describe('flowInExport', () => {
    it('finds the id and name of the one Flow', () => {
      expect(flowInExport(flowExport)).toEqual({ id: '12', name: 'Orders to SFTP' });
    });

    it('accepts a Flow whose id is not a number', () => {
      expect(flowInExport(flowExport.replace('<id>12</id>', '<id>orders-flow</id>'))).toEqual({ id: 'orders-flow', name: 'Orders to SFTP' });
    });

    it('says a text is not XML or JSON', () => {
      expect(flowInExport('this is not xml')).toContain("isn't an XML or JSON file");
    });

    describe('as JSON', () => {
      it('finds the id and name of the one Flow', () => {
        expect(flowInExport(flowJson)).toEqual({ id: '12', name: 'Orders to SFTP' });
      });

      it('accepts a numeric id', () => {
        expect(flowInExport(flowJson.replace('"12"', '12'))).toEqual({ id: '12', name: 'Orders to SFTP' });
      });

      it('says a text is not valid JSON', () => {
        expect(flowInExport('{"dil": ')).toContain("isn't valid JSON");
      });

      it('says a file has no Flow', () => {
        expect(flowInExport('{"dil":{"integrations":{}}}')).toContain("doesn't contain a Flow");
      });

      it('says a Flow without a name is not a Flow', () => {
        expect(flowInExport(flowJson.replace('"name": "Orders to SFTP"', '"type": "esb"'))).toContain("doesn't contain a Flow");
      });

      it('sends a file with several Flows to the Gateway backup import', () => {
        const flows = '{"dil":{"integrations":{"integration":{"flows":{"flow":[{"id":"1","name":"A"},{"id":"2","name":"B"}]}}}}}';
        expect(flowInExport(flows)).toContain('contains 2 Flows');
      });
    });

    it('says a file has no Flow', () => {
      expect(flowInExport('<dil><integrations/></dil>')).toContain("doesn't contain a Flow");
    });

    it('says a Flow without a name is not a Flow', () => {
      expect(flowInExport(flowExport.replace('<name>Orders to SFTP</name>', ''))).toContain("doesn't contain a Flow");
    });

    it('sends a file with several Flows to the Gateway backup import', () => {
      const flows = flowExport.replace('</flows>', '<flow><id>13</id><name>Other</name></flow></flows>');
      expect(flowInExport(flows)).toContain('contains 2 Flows');
    });
  });

  describe('xmlProblem', () => {
    it('accepts well-formed XML', () => {
      expect(xmlProblem('<route id="a"/>')).toBeUndefined();
    });

    it('refuses anything else', () => {
      expect(xmlProblem('from("timer:x")')).toBe("isn't valid XML.");
    });
  });

  it('reads a file as text', async () => {
    await expect(readText(new File(['println 1'], 'a.groovy'))).resolves.toBe('println 1');
  });
});
