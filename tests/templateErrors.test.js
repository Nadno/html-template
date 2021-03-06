const fs = require('fs');
const path = require('path');

const JSDOM = require('jsdom').JSDOM;
const Template = require('../template.js');

describe('Template expected data errors', () => {
  const acceptedTags = ['script', 'template'];

  let defaultHTMLFile;

  acceptedTags.forEach((tag) => {
    defaultHTMLFile = fs.readFileSync(
      path.resolve(__dirname, '..', `${tag}-tags.html`),
      'utf-8'
    );

    describe(`[<${tag}>]`, expectedDataErrors);
  });

  function expectedDataErrors() {
    let templateAttr, templateContent;

    beforeEach(() => {
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

    beforeEach(() => {
      const { window } = new JSDOM(defaultHTMLFile);

      global.window = window;
      global.document = window.document;
      global.HTMLElement = window.HTMLElement;
    });

    it("should throw an error when there's no template", () => {
      expect(() => new Template('#template-element-not-found')).toThrowError(
        'The argument passed to Template must be a query string or an HTMLElement'
      );
    });

    it('should throw an error when there are missing contents', () => {
      const matcher = /The content {{(\w+)}} is missing\./;
      delete templateContent.cardContent;

      expect(() =>
        new Template('#template-element').createElement({
          ...templateAttr,
          ...templateContent,
        })
      ).toThrowError(matcher);

      expect(() =>
        new Template('#template-element').createElement({
          content: templateContent,
          attr: templateAttr,
        })
      ).toThrowError(matcher);
    });

    it('should throw an error when there are missing attrs', () => {
      const matcher = /The attribute {{(\w+)}} is missing\./;
      delete templateAttr.cardAction;

      expect(() =>
        new Template('#template-element').createElement({
          ...templateAttr,
          ...templateContent,
        })
      ).toThrowError(matcher);

      expect(() =>
        new Template('#template-element').createElement({
          content: templateContent,
          attr: templateAttr,
        })
      ).toThrowError(matcher);
    });

    it("should throw an error when there's contents and none 'element[data-content]'", () => {
      expect(() =>
        new Template('#template-element-without-content').createElement({
          content: templateContent,
        })
      ).toThrowError("There wasn't any [data-content] to be assigned");
    });

    it("should throw an error when there's attrs and none 'element[data-attrs]'", () => {
      expect(() =>
        new Template('#template-element-without-attrs').createElement({
          attr: templateAttr,
        })
      ).toThrowError("There wasn't any [data-attrs] to be assigned");
    });

    it('should throw an error when invalid attributes are passed', () => {
      const invalidAttrs = [undefined, null, [], {}, function () {}];
      const template = new Template('#template-element');
      invalidAttrs.forEach((invalidAttr) =>
        expect(() =>
          template.createElement({
            attr: {
              ...templateAttr,
              cardIndex: invalidAttr,
            },
          })
        ).toThrow(TypeError)
      );
    });

    it('should throw an error when an invalid argument is passed', () => {
      const invalidArguments = [
        [],
        '',
        true,
        false,
        1,
        () => {},
        function () {},
      ];

      const template = new Template('#template-element');

      invalidArguments.forEach((arg) => {
        expect(() => template.createElement(arg)).toThrowError(
          'Data must be an object containing keys'
        );
      });
    });
  }
});
