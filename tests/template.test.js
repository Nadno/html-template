const fs = require('fs');
const path = require('path');

const JSDOM = require('jsdom').JSDOM;
const Template = require('../template.js');

const DEFAULT_HTML_FILE = fs.readFileSync(
  path.resolve(__dirname, '..', 'test.html'),
  'utf-8'
);

describe('Template functionalities', () => {
  let template, templateAttr, templateContent;

  beforeEach(() => {
    const { window } = new JSDOM(DEFAULT_HTML_FILE);

    global.window = window;
    global.document = window.document;
    global.HTMLElement = window.HTMLElement;
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

  const getCardElements = el => {
    return {
      card: el,
      cardTitle: el.querySelector('.card-title'),
      cardHeader: el.querySelector('.card-header'),
      cardContent: el.querySelector('.card-body'),
    };
  };

  const matchCard = (el, attr, content) => {
    const { card, cardTitle, cardHeader, cardContent } = getCardElements(el);
    expect(card.getAttribute('id')).toBe(`${attr.cardName}-${attr.cardIndex}`);
    expect(cardHeader.getAttribute('title')).toBe(attr.cardAction);
    expect(cardTitle.textContent).toBe(content.cardTitle);
    expect(cardContent.textContent).toBe(content.cardContent);
  };

  it('should render the template without data', () => {
    document.body.appendChild(template.createElement());
    expect(document.querySelector('.card')).not.toBeNull();
  });

  it('should render the template with separated data', () => {
    document.body.appendChild(
      template.createElement({
        content: templateContent,
        attr: templateAttr,
      })
    );

    expect(document.querySelector('.card')).not.toBeNull();
    matchCard(document.querySelector('.card'), templateAttr, templateContent);
  });

  it('should render the template without separated data', () => {
    document.body.appendChild(
      template.createElement({
        ...templateContent,
        ...templateAttr,
      })
    );

    expect(document.querySelector('.card')).not.toBeNull();
    matchCard(document.querySelector('.card'), templateAttr, templateContent);
  });

  it('should accept a HTMLElement as content', () => {
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Lorem Ipsum';
    paragraph.id = 'paragraph';

    document.body.appendChild(
      template.createElement({
        content: { ...templateContent, cardContent: paragraph },
        attr: templateAttr,
      })
    );

    expect(document.querySelector('.card')).not.toBeNull();
    expect(document.querySelector('#paragraph')).not.toBeNull();
  });

  it('should accept an Array of HTMLElement as content', () => {
    const paragraphs = ['Lorem', 'Ipsum', 'Dolor', 'Sit'];
    const cardContent = paragraphs.map(paragraph => {
      const p = document.createElement('p');
      p.textContent = paragraph;
      p.className = 'paragraph';
      return p;
    });

    document.body.appendChild(
      template.createElement({
        content: { ...templateContent, cardContent },
        attr: templateAttr,
      })
    );

    expect(document.querySelector('.card')).not.toBeNull();
    expect(document.querySelectorAll('.paragraph').length).toBe(
      paragraphs.length
    );
  });

  it('should accept an Array of String as content', () => {
    const paragraphs = ['Lorem', 'Ipsum', 'Dolor', 'Sit'];

    document.body.appendChild(
      template.createElement({
        content: { ...templateContent, cardContent: paragraphs },
        attr: templateAttr,
      })
    );

    expect(document.querySelector('.card')).not.toBeNull();
    expect(document.querySelector('.card-body').textContent).toBe(
      paragraphs.join('')
    );
  });

  it('should render the HTML in passed content only if specified on creation options', () => {
    const paragraphs = ['Lorem', 'Ipsum', 'Dolor', 'Sit'];
    const cardContent = paragraphs.map(
      paragraph => '<p class="paragraph">' + paragraph + '</p>'
    );

    document.body.appendChild(
      template.createElement(
        {
          content: { ...templateContent, cardContent },
          attr: templateAttr,
        },
        { acceptHTML: true }
      )
    );
    expect(document.querySelector('.card')).not.toBeNull();
    expect(document.querySelectorAll('.paragraph').length).toBe(
      paragraphs.length
    );
  });
});
