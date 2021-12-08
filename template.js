'use strict';

function Template(element) {
  if (typeof element === 'string') element = document.querySelector(element);
  if (!(element instanceof HTMLElement))
    throw new TypeError(
      'The argument passed to Template must be a query string or an HTMLElement'
    );

  this._template = document.createElement('div');

  if (element.tagName === 'SCRIPT' && element.type === 'text/html') {
    this._template.innerHTML = element.innerHTML;
  } else {
    this._template.appendChild(element);
  }
}

(function () {
  function TemplateBuilder(template, acceptHTML) {
    this._template = template;
    this._insertContentKey = acceptHTML
      ? 'insertAdjacentHTML'
      : 'insertAdjacentText';
  }

  TemplateBuilder.prototype = {
    build: function () {
      return this._template;
    },
    attr: function templateAttr(dataSet) {
      if (!dataSet || typeof dataSet !== 'object') return this;

      [].forEach.call(
        this._getTemplates('[data-attrs]'),
        this._setTemplateAttrs.bind(this, dataSet)
      );

      return this;
    },
    _setTemplateAttrs: function setTemplateAttrs(dataSet, $el) {
      const attrsName = $el.dataset.attrs.match(/[^;]+/g);
      if (!attrsName || !attrsName.length) return;

      attrsName.forEach(setTemplateAttribute);

      function setTemplateAttribute(attrName) {
        const attrValue = $el.getAttribute(attrName);
        if (typeof attrValue != 'string') return;

        const value = attrValue.replace(/{{+\w+}}/g, replaceTemplateStr);
        $el.setAttribute(attrName, value);
      }

      function replaceTemplateStr(templateAttr) {
        const dataKey = templateAttr.slice(2, templateAttr.length - 2);
        if (!(dataKey in dataSet))
          throw new Error('The attribute {{' + dataKey + '}} is missing.');

        if (invalidType(dataSet[dataKey]))
          throw new TypeError(
            "The value of a template attribute can't be: " + dataSet[dataKey]
          );

        return dataSet[dataKey];
      }

      function invalidType(value) {
        const type = typeof value;
        return !~['string', 'number', 'boolean'].indexOf(type);
      }

      $el.removeAttribute('data-attrs');
    },
    content: function templateContent(contentSet) {
      if (!contentSet || typeof contentSet !== 'object') return this;

      [].forEach.call(
        this._getTemplates('[data-content]'),
        this._setTemplateContent.bind(this, contentSet)
      );

      return this;
    },
    _setTemplateContent: function setTemplateContent(contentSet, $el) {
      const contentKey = String($el.dataset.content).trim();
      if (!contentKey) return;

      if (!(contentKey in contentSet))
        throw new Error('The content {{' + contentKey + '}} is missing.');

      const content = contentSet[contentKey];

      content instanceof Array
        ? content.forEach(this._setContent.bind(this, $el))
        : this._setContent($el, content);

      $el.removeAttribute('data-content');
    },
    _setContent: function setContent($el, content) {
      if (content instanceof HTMLElement) return $el.appendChild(content);
      $el[this._insertContentKey]('beforeend', content);
    },
    _getTemplates: function getTemplate(query) {
      const elements = this._template.querySelectorAll(query);
      if (elements.length === 0)
        throw new Error("There wasn't any " + query + ' to be assigned');

      return elements;
    },
  };

  Template.prototype = {
    createElement: function createTemplateElement(data, options) {
      if (data != null && !this._isObject(data))
        throw new TypeError('Data must be an object containing keys');
      if (!this._isObject(options)) options = {};

      const template = new TemplateBuilder(
        this._template.cloneNode(true),
        !!options.acceptHTML
      );

      let content = data,
        attr = data;

      const hasSeparatedProps = !!data && ('content' in data || 'attr' in data);
      if (hasSeparatedProps) {
        content = this._isObject(data.content) ? data.content : undefined;
        attr = this._isObject(data.attr) ? data.attr : undefined;
      }

      return this._unwrapElement(template.content(content).attr(attr).build());
    },
    _unwrapElement: function unwrapTemplate(element) {
      if (!element.firstElementChild) throw new TypeError('Template is empty');
      const $template = element.firstElementChild;

      try {
        $template.remove();
      } catch (e) {
        element.removeChild($template);
      }

      return $template;
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
