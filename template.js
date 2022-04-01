'use strict';

function Template(element) {
  if (typeof element === 'string') element = document.querySelector(element);
  if (!(element instanceof HTMLElement))
    throw new TypeError(
      'The argument passed to Template must be a query string or an HTMLElement'
    );

  const isTemplateTag = 'content' in element;
  if (isTemplateTag) {
    this._template = element.content;
    return;
  }

  this._template = document.createElement('div');

  const isScriptTag =
    element.tagName === 'SCRIPT' && element.type === 'text/html';

  if (isScriptTag) {
    this._template.innerHTML = element.innerHTML;
    return;
  }

  this._template.appendChild(element);
}

(function () {
  function TemplateCreator(template, acceptHTML) {
    this._template = template;
    this._insertContentKey = acceptHTML
      ? 'insertAdjacentHTML'
      : 'insertAdjacentText';
  }

  TemplateCreator.create = function createTemplateElement(
    template,
    data,
    options
  ) {
    const creator = new TemplateCreator(
      template.cloneNode(true),
      options.acceptHTML
    );

    return creator.unwrapTemplate(creator.make(data));
  };

  TemplateCreator.prototype = {
    handlers: {
      content: function templateContent($item, attr) {
        const contentKey = attr.value;
        if (!contentKey) return;

        if (!(contentKey in this.data))
          throw new Error('The content {{' + contentKey + '}} is missing.');

        const contents = this.data[contentKey];
        if (!contents || contents.length === 0) return;

        const shouldPrepend = $item.hasAttribute('prepend'),
          shouldReplace = $item.hasAttribute('replace-container');

        shouldPrepend && $item.removeAttribute('prepend');

        let where = shouldPrepend ? 'afterbegin' : 'beforeend';
        if (shouldReplace) where = shouldPrepend ? 'afterend' : 'beforebegin';

        const insertTextMethod = this._insertContentKey;
        Array.isArray(contents)
          ? contents.forEach(insertContent)
          : insertContent(contents);

        shouldReplace && $item.remove();

        function insertContent(content) {
          if (content instanceof Element)
            return $item.insertAdjacentElement(where, content);
          $item[insertTextMethod](where, content);
        }
      },
      value: function valueTemplate($item, attr) {
        if (!$item.matches('input, textarea')) return;

        const value = this.data[attr.value];
        if (value == null) return;

        $item.matches('[type=checkbox], [type=radio]')
          ? ($item.checked = value === true)
          : ($item.value = value);
      },
    },
    make: function make(data) {
      if (!data) return this._template;

      const items = Array.prototype.slice.call(
        this._template.querySelectorAll('[item]')
      );

      if (!items.length)
        throw new Error(
          'No template items found. Just use data when you have items.'
        );

      this.data = data;
      items.forEach(this.makeItem.bind(this));

      return this._template;
    },
    makeItem: function buildItem($item) {
      this._getItemAttributes($item).forEach(
        this._handleItemAttribute.bind(this, $item)
      );

      $item.removeAttribute('item');
    },
    _getItemAttributes($element) {
      const result = [],
        attributes = $element.attributes,
        length = attributes.length;

      for (let index = 0; index < length; index++) {
        const name = attributes[index].name;
        if (!name.startsWith('item-')) continue;
        result.push({ name: name, value: attributes[index].value });
      }

      return result;
    },
    _handleItemAttribute($item, itemAttr) {
      const attrName = itemAttr.name.replace(/^(item-)/, '');
      const attribute = { name: attrName, value: itemAttr.value };

      const isHandler = attrName in this.handlers;
      isHandler
        ? this.handlers[attrName].call(this, $item, attribute)
        : this.convertToAttribute($item, attribute);

      $item.removeAttribute(itemAttr.name);
    },
    convertToAttribute($item, attr) {
      $item.setAttribute(
        attr.name,
        attr.value.replace(
          /{{\w+}}/g,
          this._replaceTemplateAttribute.bind(this)
        )
      );
    },
    _replaceTemplateAttribute(templateAttr) {
      const dataKey = templateAttr.slice(2, templateAttr.length - 2);

      if (!(dataKey in this.data))
        throw new Error('The attribute {{' + dataKey + '}} is missing.');

      const value = this.data[dataKey];
      if (this._invalidType(value))
        throw new TypeError(
          "The value of a template attribute can't be: " + value
        );

      return value;
    },
    _invalidType: function invalidType(value) {
      const type = typeof value;
      return !~['string', 'number', 'boolean'].indexOf(type);
    },
    unwrapTemplate: function unwrapTemplate(element) {
      if (!element.firstElementChild) throw new TypeError('Template is empty');

      const length = element.children.length;
      if (length === 1) return element.firstElementChild;

      const childElements = new Array(length),
        children = element.children;
      for (let index = 0; index < length; index++) {
        const child = children[0];
        childElements[index] = child;

        try {
          child.remove();
        } catch (e) {
          element.removeChild(child);
        }
      }

      return childElements;
    },
  };

  Template.prototype = {
    createElement: function createTemplateElement(data, options) {
      if (data != null && !this._isObject(data))
        throw new TypeError('Data must be an object containing keys');
      if (!this._isObject(options)) options = {};

      return TemplateCreator.create(this._template, data, options);
    },
    _isObject: function isObject(value) {
      return (
        typeof value === 'object' && !Array.isArray(value) && value !== null
      );
    },
  };

  typeof exports === 'object' &&
    typeof module !== 'undefined' &&
    (module.exports = Template);
})();
