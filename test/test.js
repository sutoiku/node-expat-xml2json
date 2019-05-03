'use strict';

const fs = require('fs');
const path = require('path');
const parser = require('..');
const { expect } = require('chai');

describe('xml2json', function() {
  it('converts with array-notation', function() {
    const xml = readFixture('array-notation.xml');
    const result = parser.toJson(xml, { arrayNotation: true });
    const json = readFixture('array-notation.json');

    expect(result).to.equal(json);
  });

  it('coerces', function() {
    const xml = readFixture('coerce.xml');
    const result = parser.toJson(xml, { coerce: false });
    const json = readFixture('coerce.json');

    expect(result + '\n').to.equal(json);
  });

  it('handles domain', function() {
    const xml = readFixture('domain.xml');
    const result = parser.toJson(xml, { coerce: false });
    const json = readFixture('domain.json');

    expect(result + '\n').to.equal(json);
  });

  it('does large file', function() {
    const xml = readFixture('large.xml');
    const result = parser.toJson(xml, { coerce: false, trim: true, sanitize: false });
    const json = readFixture('large.json');

    expect(result + '\n').to.equal(json);
  });

  it('handles reorder', function() {
    const xml = readFixture('reorder.xml');
    const result = parser.toJson(xml, {});
    const json = readFixture('reorder.json');

    expect(result).to.equal(json);
  });

  it('handles text with space', function() {
    const xml = readFixture('spacetext.xml');
    const result = parser.toJson(xml, { coerce: false, trim: false });
    const json = readFixture('spacetext.json');

    expect(result).to.equal(json);
  });

  it('does xmlsanitize', function() {
    const xml = readFixture('xmlsanitize.xml');
    const result = parser.toJson(xml, { sanitize: true });
    const json = readFixture('xmlsanitize.json');

    expect(result).to.equal(json);
  });

  it('does xmlsanitize of text', function() {
    const xml = readFixture('xmlsanitize2.xml');
    const result = parser.toJson(xml, { sanitize: true, reversible: true });
    const json = readFixture('xmlsanitize2.json');

    expect(result).to.equal(json);
  });

  it('does doesnt double unsanitize', function() {
    const xml = readFixture('xmlsanitize3.xml');
    const result = parser.toJson(xml, { sanitize: true, reversible: true });
    const json = readFixture('xmlsanitize3.json');

    expect(result).to.equal(json);
  });

  it('converts with forceArrays', function() {
    const xml = readFixture('forceArray.xml');
    const result = parser.toJson(xml, { arrayNotation: ['drivers', 'vehicles'] });
    const json = readFixture('forceArray.json');

    expect(result).to.equal(json);
  });

  describe('coercion', function() {
    const data = fs.readFileSync(path.join(__dirname, 'fixtures', 'coerce.xml'));

    it('works with coercion', function() {
      const result = parser.toJson(data, { reversible: true, coerce: true, object: true });
      expect(result.itemRecord.value[0].longValue.$t).to.equal(12345);
      expect(result.itemRecord.value[1].stringValue.number).to.equal(false);
      expect(result.itemRecord.value[2].moneyValue.number).to.equal(true);
      expect(result.itemRecord.value[2].moneyValue.$t).to.equal(104.95);
      expect(result.itemRecord.value[2].moneyValue.text).to.equal(123.45);
    });

    it('works without coercion', function() {
      const result = parser.toJson(data, { reversible: true, coerce: false, object: true });
      expect(result.itemRecord.value[0].longValue.$t).to.equal('12345');
      expect(result.itemRecord.value[1].stringValue.number).to.equal('false');
      expect(result.itemRecord.value[2].moneyValue.number).to.equal('true');
      expect(result.itemRecord.value[2].moneyValue.$t).to.equal('104.95');
      expect(result.itemRecord.value[2].moneyValue.text).to.equal('123.45');
    });

    it('works with coercion as an optional object', function() {
      const result = parser.toJson(data, { reversible: true, coerce: { text: String }, object: true });
      expect(result.itemRecord.value[0].longValue.$t).to.equal(12345);
      expect(result.itemRecord.value[1].stringValue.number).to.equal(false);
      expect(result.itemRecord.value[2].moneyValue.number).to.equal(true);
      expect(result.itemRecord.value[2].moneyValue.$t).to.equal(104.95);
      expect(result.itemRecord.value[2].moneyValue.text).to.equal('123.45');
    });
  });

  describe('alternateTextNode', function() {
    it('A1: defaults without the option being defined', function() {
      const xml = readFixture('alternate-text-node-A.xml');
      const result = parser.toJson(xml, { reversible: true });
      const json = readFixture('alternate-text-node-A.json');

      expect(result).to.equal(json);
    });

    it('A2: defaults with option as false', function() {
      const xml = readFixture('alternate-text-node-A.xml');
      const result = parser.toJson(xml, { alternateTextNode: false, reversible: true });
      const json = readFixture('alternate-text-node-A.json');

      expect(result).to.equal(json);
    });

    it('B: uses alternate text node with option as true', function() {
      const xml = readFixture('alternate-text-node-A.xml');
      const result = parser.toJson(xml, { alternateTextNode: true, reversible: true });
      const json = readFixture('alternate-text-node-B.json');

      expect(result).to.equal(json);
    });

    it('C: overrides text node with option as "xx" string', function() {
      const xml = readFixture('alternate-text-node-A.xml');
      const result = parser.toJson(xml, { alternateTextNode: 'xx', reversible: true });
      const json = readFixture('alternate-text-node-C.json');

      expect(result).to.equal(json);
    });

    it('D: double check sanatize and trim', function() {
      const xml = readFixture('alternate-text-node-D.xml');
      const result = parser.toJson(xml, { alternateTextNode: 'zz', sanitize: true, trim: true, reversible: true });
      const json = readFixture('alternate-text-node-D.json');

      expect(result).to.equal(json);
    });
  });
});

describe('json2xml', function() {
  it('converts domain to json', function() {
    const json = readFixture('domain-reversible.json');
    const result = parser.toXml(json);
    const xml = readFixture('domain.xml');

    expect(result + '\n').to.equal(xml);
  });

  it('works with array notation', function() {
    const xml = readFixture('array-notation.xml');
    const expectedJson = JSON.parse(readFixture('array-notation.json'));

    const json = parser.toJson(xml, { object: true, arrayNotation: true });
    expect(json).to.deep.equal(expectedJson);
  });

  describe('ignore null', function() {
    it('ignore null properties {ignoreNull: true}', function() {
      const json = JSON.parse(readFixture('null-properties.json'));
      const expectedXml = readFixture('null-properties-ignored.xml');

      const xml = parser.toXml(json, { ignoreNull: true });
      expect(xml).to.equal(expectedXml);
    });

    it("don't ignore null properties (default)", function() {
      const json = JSON.parse(readFixture('null-properties.json'));
      const expectedXml = readFixture('null-properties-not-ignored.xml');

      const xml = parser.toXml(json);
      expect(xml).to.equal(expectedXml);
    });
  });
});

function readFixture(file) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', file), { encoding: 'utf-8' });
}
