import test from 'ava';
import { JSDOM } from 'jsdom';
import {
  hasTagName,
  createNodeWith,
  replaceNodeWith,
  unwrapNode,
  textifyNode,
  removeNodes,
  removeEmptyTextNodes,
  removeCommentNodes,
  resetAttributesTo,
  replaceNodeStyleByTag,
  trimTag
} from '../src/core/dom.js';

test('core.dom.hasTagName', t => {
  const dom = new JSDOM('<!DOCTYPE html><p>Hello world</p>');

  t.false(hasTagName(dom.window.document.querySelector('p'), 'i'));
  t.false(hasTagName(dom.window.document.querySelector('p'), ['i', 'u']));
  t.true(hasTagName(dom.window.document.querySelector('p'), 'p'));
  t.true(hasTagName(dom.window.document.querySelector('p'), ['i', 'u', 'p']));
});

test('core.dom.createNodeWith', t => {
  const node1 = createNodeWith('span', { innerHTML: '<b>Bold text</b>', attributes: { attr1: 'value1', attr2: 'value2' } });
  t.is(node1.outerHTML, '<span attr1="value1" attr2="value2"><b>Bold text</b></span>');

  const node2 = createNodeWith('span', { textContent: 'Simple text', attributes: { attr1: 'value1', attr2: 'value2' } });
  t.is(node2.outerHTML, '<span attr1="value1" attr2="value2">Simple text</span>');
});

test('core.dom.replaceNodeWith', t => {
  const dom = new JSDOM('<!DOCTYPE html><p>Hello world</p>');
  const node = document.createElement('span');
  node.textContent = 'Simple text';

  replaceNodeWith(dom.window.document.querySelector('p'), node);
  t.is(dom.window.document.body.innerHTML, '<span>Simple text</span>');
});

test('core.dom.unwrapNode', t => {
  const dom = new JSDOM('<!DOCTYPE html><div><b>Hello world</b>, this is a simple text</div>');

  unwrapNode(dom.window.document.querySelector('div'));
  t.is(dom.window.document.body.innerHTML, '<b>Hello world</b>, this is a simple text');
});

test('core.dom.textifyNode', t => {
  const dom = new JSDOM('<!DOCTYPE html><div><b>Hello world</b>, this is a simple text</div>');

  textifyNode(dom.window.document.querySelector('div'));
  t.is(dom.window.document.body.innerHTML, 'Hello world, this is a simple text');
});

test('core.dom.removeNodes', t => {
  const dom = new JSDOM('<!DOCTYPE html><div></div><p>Hello world</p><span></span>');

  removeNodes(dom.window.document.body, (el) => el.nodeType === Node.ELEMENT_NODE && el.tagName !== 'P');
  t.is(dom.window.document.body.innerHTML, '<p>Hello world</p>');
});

test('core.dom.removeEmptyTextNodes', t => {
  const dom = new JSDOM('<!DOCTYPE html><p>Hello world <b> </b></p> <!-- Comments --> <div> </div>');

  removeEmptyTextNodes(dom.window.document.body);
  t.is(dom.window.document.body.innerHTML, '<p>Hello world <b> </b></p><!-- Comments --><div> </div>');
});

test('core.dom.removeCommentNodes', t => {
  const dom = new JSDOM('<!DOCTYPE html><p>Hello world <b> </b></p> <!-- Comments --> <div> </div>');

  removeCommentNodes(dom.window.document.body);
  t.is(dom.window.document.body.innerHTML, '<p>Hello world <b> </b></p>  <div> </div>');
});

test('core.dom.resetAttributesTo', t => {
  const node = document.createElement('span');
  node.setAttribute('attr1', 'value1');
  node.setAttribute('attr2', 'value2');
  node.setAttribute('attr3', 'value3');
  node.textContent = 'Simple text';

  resetAttributesTo(node, { foo: 'bar' });
  t.is(node.outerHTML, '<span foo="bar">Simple text</span>');

  resetAttributesTo(node, { });
  t.is(node.outerHTML, '<span>Simple text</span>');
});

test('core.dom.replaceNodeStyleByTag', t => {
  let node = document.createElement('b');
  node.setAttribute('style', 'font-weight: normal;');
  node.textContent = 'Simple text';

  node = replaceNodeStyleByTag(node);
  t.is(node.outerHTML, '<span style="font-weight: normal;">Simple text</span>');

  node = document.createElement('span');
  node.setAttribute('style', 'font-weight: 900;');
  node.textContent = 'Simple text';

  node = replaceNodeStyleByTag(node);
  t.is(node.outerHTML, '<b><span style="">Simple text</span></b>');

  node = document.createElement('span');
  node.setAttribute('style', 'font-style: italic;');
  node.textContent = 'Simple text';

  node = replaceNodeStyleByTag(node);
  t.is(node.outerHTML, '<i><span style="">Simple text</span></i>');
});

test('core.dom.trimTag', t => {
  const dom = new JSDOM('<!DOCTYPE html><div></div><div></div><p>Hello world</p><div></div><span>Simple text</span><div></div>');

  trimTag(dom.window.document.body, 'div');
  t.is(dom.window.document.body.innerHTML, '<p>Hello world</p><div></div><span>Simple text</span>');
});
