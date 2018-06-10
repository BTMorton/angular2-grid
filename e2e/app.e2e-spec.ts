import { Angular2GridDemoPage } from './app.po';

describe('angular2-grid-demo App', function() {
  let page: Angular2GridDemoPage;

  beforeEach(() => {
    page = new Angular2GridDemoPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
