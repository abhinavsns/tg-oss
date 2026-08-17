/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @typescript-eslint/no-empty-function */
// test-setup.js
import { JSDOM } from "jsdom";
import { afterEach } from "bun:test";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom"; // Import for custom matchers

const jsdomInstance = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  pretendToBeVisual: true,
  url: "http://localhost/"
});

Object.assign(global, {
  window: jsdomInstance.window,
  document: jsdomInstance.window.document,
  navigator: jsdomInstance.window.navigator,
  Node: jsdomInstance.window.Node,
  Element: jsdomInstance.window.Element,
  HTMLElement: jsdomInstance.window.HTMLElement,
  SVGElement: jsdomInstance.window.SVGElement,
  customElements: jsdomInstance.window.customElements,
  DocumentFragment: jsdomInstance.window.DocumentFragment,
  Event: jsdomInstance.window.Event,
  CustomEvent: jsdomInstance.window.CustomEvent,
  KeyboardEvent: jsdomInstance.window.KeyboardEvent,
  MouseEvent: jsdomInstance.window.MouseEvent,
  localStorage: jsdomInstance.window.localStorage,
  sessionStorage: jsdomInstance.window.sessionStorage,
  alert: jsdomInstance.window.alert,
  confirm: jsdomInstance.window.confirm,
  getComputedStyle: jsdomInstance.window.getComputedStyle,
  IS_REACT_ACT_ENVIRONMENT: true
});

for (const property of Object.getOwnPropertyNames(window)) {
  if (!(property in global)) {
    Object.defineProperty(
      global,
      property,
      Object.getOwnPropertyDescriptor(window, property)
    );
  }
}

global.IntersectionObserver ??= class IntersectionObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
};

global.ResizeObserver ??= class ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
};

window.matchMedia ??= () => ({
  addEventListener() {},
  addListener() {},
  matches: false,
  removeEventListener() {},
  removeListener() {}
});

window.toastr = {
  error() {},
  info() {},
  success() {},
  warning() {}
};

Object.defineProperties(HTMLElement.prototype, {
  offsetHeight: { configurable: true, get: () => 600 },
  offsetWidth: { configurable: true, get: () => 800 }
});

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
  localStorage.clear();
  sessionStorage.clear();
});
