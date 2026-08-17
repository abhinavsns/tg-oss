import React, { useLayoutEffect, useRef, useState } from "react";
import { Provider } from "react-redux";
import makeStore from "./makeStore";
import { createRoot } from "react-dom/client";

import Editor from "../Editor";
import updateEditor from "../updateEditor";
import addAlignment from "../addAlignment";
import AlignmentView from "../AlignmentView";
import VersionHistoryView from "../VersionHistoryView";

let store;

function StandaloneEditor(props) {
  if (!store) {
    store = makeStore();
  }
  return (
    <Provider store={store}>
      <Editor {...props} />
    </Provider>
  );
}

function StandaloneAlignment(props) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const updateWidth = () => setWidth(container.getBoundingClientRect().width);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  if (!store) {
    store = makeStore();
  }
  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <Provider store={store}>
        <AlignmentView {...{ ...props, dimensions: { width } }} />
      </Provider>
    </div>
  );
}

function StandaloneVersionHistoryView(props) {
  if (!store) {
    store = makeStore();
  }
  return (
    <Provider store={store}>
      <VersionHistoryView {...{ ...props }} />
    </Provider>
  );
}

export default function createVectorEditor(
  _node,
  { editorName = "StandaloneEditor", ...rest } = {}
) {
  if (!store) {
    store = makeStore();
  }
  let node;

  if (_node === "createDomNodeForMe") {
    node = document.createElement("div");
    node.className = "ove-created-div";
    document.body.appendChild(node);
  } else {
    node = _node;
  }
  const root = createRoot(node);
  const editor = { renderResponse: root };
  root.render(<StandaloneEditor {...{ editorName, ...rest }} />);
  editor.close = () => {
    root.unmount();
    node.remove();
  };
  editor.updateEditor = values => {
    updateEditor(store, editorName, values);
  };
  editor.addAlignment = values => {
    addAlignment(store, values);
  };
  editor.getState = () => {
    return store.getState().VectorEditor[editorName];
  };

  return editor;
}

export function createVersionHistoryView(
  node,
  { editorName = "StandaloneVersionHistoryView", ...rest } = {}
) {
  if (!store) {
    store = makeStore();
  }
  const root = createRoot(node);
  const editor = { renderResponse: root };
  root.render(<StandaloneVersionHistoryView {...{ editorName, ...rest }} />);
  editor.close = () => root.unmount();

  editor.updateEditor = values => {
    updateEditor(store, editorName, values);
  };
  editor.getState = () => {
    return store.getState().VectorEditor["StandaloneVersionHistoryView"];
  };

  return editor;
}

export function createAlignmentView(node, props = {}) {
  if (!store) {
    store = makeStore();
  }
  const root = createRoot(node);
  const editor = { renderResponse: root };
  root.render(<StandaloneAlignment {...props} />);
  editor.close = () => root.unmount();

  editor.updateAlignment = values => {
    addAlignment(store, values);
  };
  editor.updateAlignment(props);
  editor.getState = () => {
    if (!props.id) {
      throw new Error(
        'Please pass an id when using createAlignmentView. eg createAlignmentView(myDiv, {id: "someUniqueId"})'
      );
    }
    return store.getState().VectorEditor.__allEditorsOptions.alignments[
      props.id
    ];
  };
  return editor;
}

window.createVectorEditor = createVectorEditor;
window.createAlignmentView = createAlignmentView;
window.createVersionHistoryView = createVersionHistoryView;
