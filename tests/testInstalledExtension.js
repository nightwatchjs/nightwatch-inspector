describe('test Nightwatch Inspector extension in DevTools', function() {
  before(function() {
    browser.navigateTo('https://nightwatchjs.org');
  })

  it('switches to devtools window, opens extension tab and checks title', async function() {
    // get all targets (contexts) we can possibly switch to
    const targets = await browser.driver.sendAndGetDevToolsCommand('Target.getTargets', {});

    const devToolsTarget = targets.targetInfos.find(target => {
      return target.type === 'page' &&
        target.url.includes('devtools://devtools/bundled/devtools_app.html');
    });

    // switch to DevTools window context
    await browser.window.switchTo(devToolsTarget.targetId);

    // switch to last tab in pane (our extension)
    await browser.sendKeys('body', [browser.Keys.COMMAND, '[']); // for macos
    await browser.sendKeys('body', [browser.Keys.CONTROL, '[']); // for windows/linux

    // switch to iframe inside "Nightwatch Inspector" tab
    await browser.frame('iframe[src*="index.html"]');

    // run automation on the extension
    await browser.element('header').getText().assert.equals('Nightwatch Inspector');

    // to visualize the extension during test run
    await browser.pause(1000);
  });
});

