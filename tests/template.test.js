const fs = require('fs');
const path = require('path');

const JSDOM = require('jsdom').JSDOM;
const Template = require('../template.js');

describe('Template functionalities', () => {
  const acceptedTags = ['script', 'template'];

  let defaultHTMLFile;

  acceptedTags.forEach((tag) => {
    defaultHTMLFile = fs.readFileSync(
      path.resolve(__dirname, '..', `${tag}-tags.html`),
      'utf-8'
    );

    describe(`[<${tag}>]`, templateFunctionalities);
  });

  function templateFunctionalities() {
    let template, templateAttr, templateContent;

    beforeEach(() => {
      const { window } = new JSDOM(defaultHTMLFile);

      global.window = window;
      global.document = window.document;
      global.HTMLElement = window.HTMLElement;
      global.Element = window.Element;
    });

    beforeEach(() => {
      template = new Template('#template-element');

      templateAttr = {
        cardName: 'card',
        cardIndex: 0,
        cardAction: 'Clique para uma surpresa',
      };

      templateContent = {
        cardTitle: 'Lorem Ipsum Dolo Sit',
        cardContent: 'Nadinha',
      };
    });

    it('should render the template without data', () => {
      document.body.appendChild(template.createElement());
      expect(document.querySelector('.card')).not.toBeNull();
    });

    it('should accept a HTMLElement as content', () => {
      const paragraph = document.createElement('p');
      paragraph.textContent = 'Lorem Ipsum';
      paragraph.id = 'paragraph';

      document.body.appendChild(
        template.createElement({
          ...templateContent,
          ...templateAttr,
          cardContent: paragraph,
        })
      );

      expect(document.querySelector('.card')).not.toBeNull();
      expect(document.querySelector('#paragraph')).not.toBeNull();
    });

    it('should accept an Array of HTMLElement as content', () => {
      const paragraphs = ['Lorem', 'Ipsum', 'Dolor', 'Sit'];
      const cardContent = paragraphs.map((paragraph) => {
        const p = document.createElement('p');
        p.textContent = paragraph;
        p.className = 'paragraph';
        return p;
      });

      document.body.appendChild(
        template.createElement({
          ...templateContent,
          ...templateAttr,
          cardContent,
        })
      );

      expect(document.querySelector('.card')).not.toBeNull();
      expect(document.querySelectorAll('.paragraph').length).toBe(
        paragraphs.length
      );
    });

    it('should accept an Array of String as content', () => {
      const words = ['Lorem', 'Ipsum', 'Dolor', 'Sit'];

      document.body.appendChild(
        template.createElement({
          ...templateContent,
          ...templateAttr,
          cardContent: words,
        })
      );

      expect(document.querySelector('.card')).not.toBeNull();
      expect(document.querySelector('.card-body').textContent).toBe(
        words.join('')
      );
    });

    it('should render the HTML in passed content only if specified on creation options', () => {
      const words = ['Lorem', 'Ipsum', 'Dolor', 'Sit'];
      const cardContent = words.map(
        (word) => '<p class="paragraph">' + word + '</p>'
      );

      document.body.appendChild(
        template.createElement(
          {
            ...templateContent,
            ...templateAttr,
            cardContent,
          },
          { acceptHTML: true }
        )
      );
      expect(document.querySelector('.card')).not.toBeNull();
      expect(document.querySelectorAll('.paragraph').length).toBe(words.length);
    });

    it('should controls the content insertion using [replace-container] and [prepend] attributes options', () => {
      const words = ['Lorem', 'Ipsum', 'Dolor', 'Sit'],
        expectedAppend = words.slice(),
        expectedPrepend = words.slice().reverse();

      template = new Template('#template-element-for-replace');

      const $templateElement = template._template,
        $cardBodyContentContainer = $templateElement.querySelector(
          '.card-body-content-container'
        );

      const templateData = {
        ...templateContent,
        ...templateAttr,
        cardContent: words,
      };

      const $appended = template.createElement(templateData);

      $cardBodyContentContainer.setAttribute('prepend', '');
      const $prepended = template.createElement(templateData);

      $cardBodyContentContainer.setAttribute('replace-container', '');
      const $containerReplaced = template.createElement(templateData);

      expect(
        $appended.querySelector('.card-body-content-container').textContent
      ).toBe(expectedAppend.join(''));

      expect(
        $prepended.querySelector('.card-body-content-container').textContent
      ).toBe(expectedPrepend.join(''));

      expect(
        $containerReplaced.querySelector('.card-body-content-container')
      ).toBeNull();

      expect(
        $containerReplaced.querySelector('.card-body').textContent.trim()
      ).toBe([...expectedPrepend].join(''));
    });

    it('should return all children when having it', () => {
      const template = new Template('#template-element-check-value');
      expect(() => {
        const [$first, $second, $third] = template.createElement({
          textValue: '',
          trueToggleValue: true,
          falseToggleValue: false,
        });

        expect($first.type).toBe('text');
        expect($second.type).toBe('checkbox');
        expect($third.type).toBe('radio');
      }).not.toThrow();
    });

    it('should assign the [item-value] to the inputs values', () => {
      const template = new Template('#template-element-check-value');
      const [$first, $second, $third] = template.createElement({
        textValue: 'Some text',
        trueToggleValue: true,
        falseToggleValue: false,
      });

      expect($first.value).toBe('Some text');
      expect($second.checked).toBe(true);
      expect($third.checked).toBe(false);
    });
  }
});
