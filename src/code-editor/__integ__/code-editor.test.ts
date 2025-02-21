// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import useBrowser from '@cloudscape-design/browser-test-tools/use-browser';
import { BasePageObject } from '@cloudscape-design/browser-test-tools/page-objects';
import createWrapper from '../../../lib/components/test-utils/selectors';

const wrapper = createWrapper();
const codeEditorWrapper = wrapper.findCodeEditor();
const controlOrCommandKey = process.platform === 'darwin' ? 'Command' : 'Control';

class CodeEditorPageObject extends BasePageObject {
  getEditorContent() {
    return this.getText(codeEditorWrapper.findEditor().find('.ace_content').toSelector());
  }

  async typeIntoEditor(keys: string) {
    await this.click(codeEditorWrapper.findEditor().toSelector());
    await this.keys(keys);
  }

  async selectAnnotation() {
    await this.click(codeEditorWrapper.findEditor().find('.ace_error').toSelector());
  }
  async getEditorHeight() {
    return (await this.browser.$('.react-resizable')).getSize('height');
  }
  async getEditorHeightById(elementId: string) {
    return (await this.browser.$(`#${elementId} .react-resizable`)).getSize('height');
  }
  async isDisplayedInViewport(selector: string) {
    return (await this.browser.$(selector)).isDisplayedInViewport();
  }
  async getEventValue() {
    return (await this.browser.$(`#event-content`)).getText();
  }
  findHandle() {
    return wrapper.findCodeEditor('#code-editor-controlled').find('.react-resizable > span').toSelector();
  }
  async dragResizer({ x: deltaX, y: deltaY }: { x: number; y: number }) {
    const handleSelector = await this.findHandle();
    const resizerBox = await this.getBoundingBox(handleSelector);
    const currentX = Math.ceil(resizerBox.left);
    const currentY = Math.ceil(resizerBox.top);
    await this.browser.performActions([
      {
        type: 'pointer',
        id: 'mouse',
        parameters: { pointerType: 'mouse' },
        actions: [
          { type: 'pointerMove', duration: 0, x: currentX, y: currentY }, // hover on the resizer
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 30 }, // extra delay to allow event listeners to update
          { type: 'pointerMove', duration: 0, x: currentX + deltaX, y: currentY + deltaY },
          { type: 'pause', duration: 30 }, // extra delay to allow event listeners to update
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);
  }
}

const simplePage = '#/light/code-editor/simple';
const verticalScrollPage = '#/light/code-editor/vertical-scroll';
const controllableHeightPage = '#/light/code-editor/controllable-height';

const setupTest = (pageUrl: string, testFn: (page: CodeEditorPageObject) => Promise<void>) => {
  return useBrowser(async browser => {
    const page = new CodeEditorPageObject(browser);
    await browser.url(pageUrl);
    await page.waitForVisible('.ace_content');
    await testFn(page);
  });
};
test(
  'Commenting multiple lines',
  setupTest(simplePage, async page => {
    await page.click(codeEditorWrapper.findEditor().toSelector());
    await page.keys('\nconst a = 123;\nconst b = 234;\nconst c = 345;\n');
    await page.keys([controlOrCommandKey, 'a']);
    await page.keys([controlOrCommandKey, '/']);
    await expect(page.getEditorContent()).resolves.toEqual(
      '// const pi = 3.14;\n// const a = 123;\n// const b = 234;\n// const c = 345;'
    );
  })
);
test(
  `Tab text reduces when screen is small`,
  setupTest(simplePage, async page => {
    await page.setWindowSize({ width: 1600, height: 400 });
    await expect(page.getText(codeEditorWrapper.findErrorsTab().toSelector())).resolves.toEqual('Errors: 0');
    await expect(page.getText(codeEditorWrapper.findWarningsTab().toSelector())).resolves.toEqual('Warnings: 0');
    await page.setWindowSize({ width: 400, height: 400 });
    await expect(page.getText(codeEditorWrapper.findErrorsTab().toSelector())).resolves.toEqual('0');
    await expect(page.getText(codeEditorWrapper.findWarningsTab().toSelector())).resolves.toEqual('0');
  })
);
test(
  'Can reset controlled value',
  setupTest(simplePage, async page => {
    await page.click(codeEditorWrapper.findEditor().toSelector());
    await page.keys('\nabcde');
    await expect(page.getEditorContent()).resolves.toEqual('const pi = 3.14;\nabcde');

    await page.click('button=Reset value');
    await expect(page.getEditorContent()).resolves.toEqual('const pi = 3.14;');
  })
);
test(
  'Focuses code editor and preferences button',
  setupTest(simplePage, async page => {
    await page.click(codeEditorWrapper.findEditor().toSelector());
    await page.keys('\nabcde');

    await page.click('h1');
    await page.keys('Tab');
    await expect(page.isFocused(codeEditorWrapper.findEditor().toSelector())).resolves.toBe(true);

    await page.keys('Tab');
    await expect(page.isFocused(codeEditorWrapper.findSettingsButton().toSelector())).resolves.toBe(true);

    await page.keys('Tab');
    await expect(page.isFocused('#javascript_sample_button')).resolves.toBe(true);
  })
);
test(
  'focuses annotation and scrolls it into view',
  setupTest(verticalScrollPage, async page => {
    const { top: scrollBefore } = await page.getWindowScroll();
    await page.typeIntoEditor('{(');
    await page.selectAnnotation();
    const { top: scrollAfter } = await page.getWindowScroll();
    await expect(page.isDisplayedInViewport(codeEditorWrapper.findPane().toSelector())).resolves.toBe(true);
    expect(scrollAfter).toBeGreaterThan(scrollBefore);
  })
);
test(
  'does not change scroll if annotation is already in the view',
  setupTest(verticalScrollPage, async page => {
    await page.windowScrollTo({ top: 700 });
    const { top: scrollBefore } = await page.getWindowScroll();
    await page.typeIntoEditor('{(');
    await page.selectAnnotation();
    const { top: scrollAfter } = await page.getWindowScroll();
    await expect(page.isDisplayedInViewport(codeEditorWrapper.findPane().toSelector())).resolves.toBe(true);
    expect(scrollAfter).toEqual(scrollBefore);
  })
);
test(
  'sets default editor height to 480',
  setupTest(simplePage, async page => {
    await expect(page.getEditorHeight()).resolves.toEqual(480);
  })
);
test(
  'sets editor height correctly when a size is specified',
  setupTest(controllableHeightPage, async page => {
    await expect(page.getEditorHeightById('code-editor-controlled')).resolves.toEqual(240);
  })
);
test(
  'sets editor height smaller than 20 to 20px',
  setupTest(controllableHeightPage, async page => {
    await expect(page.getEditorHeightById('editor-minheight')).resolves.toEqual(20);
  })
);
//react-resizable interactions can only be tested in integration tests
//so we test the resize interaction here by binding the event content to a text element.
test(
  'onResize is fired with the correct height value',
  setupTest(controllableHeightPage, async page => {
    await page.dragResizer({ x: 0, y: 25 });
    await expect(page.getEditorHeightById('code-editor-controlled')).resolves.toEqual(265);
    await expect(page.getEventValue()).resolves.toEqual('current Height : 265');
  })
);
