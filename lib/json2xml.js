'use strict';

module.exports = function(json, options) {
  const toXml = new ToXml(options);
  const obj = getObject(json);
  return toXml.parse(obj);
};

function getObject(json) {
  if (json instanceof Buffer) {
    json = json.toString();
  }

  return typeof json === 'string' ? JSON.parse(json) : json;
}

class ToXml {
  constructor(options) {
    this.options = Object.assign({ ignoreNull: false }, options);
    this.xml = '';
    this.tagIncomplete = false;
  }

  parse(obj) {
    if (!obj) {
      return this.xml;
    }

    const keys = Object.keys(obj);

    // First pass, extract strings only
    for (const key of keys) {
      const value = obj[key];
      const isArray = Array.isArray(value);
      const type = typeof value;
      if (type !== 'string' && type !== 'number' && type !== 'boolean' && !isArray) {
        continue;
      }

      const collection = isArray ? value : [value];
      for (const subVal of collection) {
        if (typeof subVal === 'object') {
          continue;
        }

        if (key === '$t') {
          this.addTextContent(subVal);
        } else {
          this.addAttr(key, subVal);
        }
      }
    }

    // Second path, now handle sub-objects and arrays
    for (const key of keys) {
      if (Array.isArray(obj[key])) {
        for (const elem of obj[key]) {
          if (typeof elem === 'object') {
            this.parseItem(key, elem);
          }
        }
      } else if (typeof obj[key] === 'object' && !(this.options.ignoreNull && obj[key] === null)) {
        this.parseItem(key, obj[key]);
      }
    }

    return this.xml;
  }

  parseItem(key, elem) {
    this.openTag(key);
    this.parse(elem);
    this.closeTag(key);
  }

  openTag(key) {
    this.completeTag();
    this.xml += '<' + key;
    this.tagIncomplete = true;
  }

  addAttr(key, val) {
    this.xml += ` ${key}="${val}"`;
  }

  addTextContent(text) {
    this.completeTag();
    this.xml += text;
  }

  closeTag(key) {
    this.completeTag();
    this.xml += `</${key}>`;
  }

  completeTag() {
    if (this.tagIncomplete) {
      this.xml += '>';
      this.tagIncomplete = false;
    }
  }
}
