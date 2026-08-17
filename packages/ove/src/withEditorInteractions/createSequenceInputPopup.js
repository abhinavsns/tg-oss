import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";

import { getRangeLength } from "@teselagen/range-utils";
// import Tether from "tether";
import Popper from "popper.js";

import {
  getInsertBetweenVals,
  convertDnaCaretPositionOrRangeToAA,
  filterSequenceString
} from "@teselagen/sequence-utils";
import React from "react";
import { divideBy3 } from "../utils/proteinUtils";
import "./createSequenceInputPopupStyle.css";
import { Classes } from "@blueprintjs/core";
import { getNodeToRefocus } from "../utils/editorUtils";
import { noop } from "lodash-es";

let activePopup;

class SequenceInputNoHotkeys extends React.Component {
  state = {
    charsToInsert: "",
    hasTempError: false
  };
  componentDidMount() {
    document.addEventListener(
      "mousedown",
      this.handleUnmountIfClickOustidePopup
    );
  }

  componentWillUnmount() {
    document.removeEventListener(
      "mousedown",
      this.handleUnmountIfClickOustidePopup
    );
  }
  handleUnmountIfClickOustidePopup = e => {
    const node = this.popupRef.current?.parentNode;
    if (!node) return;
    if (node.contains(e.target)) {
      return;
    }
    this.handleUnmount();
  };
  handleUnmount = () => {
    setTimeout(() => {
      this.props.closePopup();
      this.props.nodeToReFocus && this.props.nodeToReFocus.focus();
    });
  };
  popupRef = React.createRef();
  handleInsert(charsToInsert = this.state.charsToInsert) {
    const { handleInsert = noop, isProtein } = this.props;
    if (!charsToInsert.length) {
      return;
    }
    const seqToInsert = isProtein
      ? {
          proteinSequence: charsToInsert,
          isProtein: true
        }
      : {
          sequence: charsToInsert
        };
    handleInsert(seqToInsert);
  }
  render() {
    const {
      isReplace,
      selectionLayer,
      sequenceLength,
      isProtein,
      caretPosition,
      sequenceData,
      maxInsertSize,
      getAcceptedInsertChars,
      showAminoAcidUnitAsCodon
    } = this.props;
    const { charsToInsert, hasTempError } = this.state;

    let message;
    if (isReplace) {
      const betweenVals = getInsertBetweenVals(
        -1,
        selectionLayer,
        sequenceLength
      );

      message = (
        <span>
          Press <span style={{ fontWeight: "bolder" }}>ENTER</span> to replace{" "}
          {divideBy3(getRangeLength(selectionLayer, sequenceLength), isProtein)}{" "}
          {isProtein
            ? showAminoAcidUnitAsCodon
              ? "codons"
              : "AAs"
            : "base pairs"}{" "}
          between{" "}
          {isProtein
            ? convertDnaCaretPositionOrRangeToAA(betweenVals[0])
            : betweenVals[0]}{" "}
          and{" "}
          {isProtein
            ? convertDnaCaretPositionOrRangeToAA(betweenVals[1] + 2)
            : betweenVals[1]}
        </span>
      );
    } else {
      message = (
        <span>
          Press <span style={{ fontWeight: "bolder" }}>ENTER</span> to insert{" "}
          {charsToInsert.length}{" "}
          {isProtein
            ? `${showAminoAcidUnitAsCodon ? "codons" : "AAs"}`
            : "base pairs"}{" "}
          after{" "}
          {isProtein ? `${showAminoAcidUnitAsCodon ? "codon" : "AA"}` : "base"}{" "}
          {isProtein
            ? convertDnaCaretPositionOrRangeToAA(caretPosition)
            : caretPosition}
        </span>
      );
    }
    return (
      <div ref={this.popupRef} className="sequenceInputBubble">
        <input
          autoCorrect="off"
          onKeyDown={e => {
            if (e.keyCode === 27) {
              this.handleUnmount();
            }
            if (e.keyCode === 13) {
              this.handleInsert(e.currentTarget.value);
              this.handleUnmount();
            }
          }}
          className={Classes.INPUT}
          value={charsToInsert}
          autoFocus
          style={hasTempError ? { borderColor: "red" } : {}}
          onChange={e => {
            const [sanitizedVal, warnings] = filterSequenceString(
              e.target.value,
              {
                ...sequenceData,
                name: undefined,
                getAcceptedInsertChars
              }
            );
            if (warnings.length) {
              this.setState({
                hasTempError: true
              });
              setTimeout(() => {
                this.setState({
                  hasTempError: false
                });
              }, 200);
            }
            if (maxInsertSize && sanitizedVal.length > maxInsertSize) {
              return window.toastr.error(
                `Sorry, your insert is greater than ${maxInsertSize}`
              );
            }
            e.target.value = sanitizedVal;
            this.setState({ charsToInsert: sanitizedVal });
          }}
        />
        <div style={{ marginTop: 10 }}>{message}</div>
        <div style={{ marginTop: 10 }}>
          Press <span style={{ fontWeight: "bolder" }}>ESC</span> to{" "}
          <button className="link-button" onClick={this.handleUnmount}>
            cancel
          </button>
        </div>
      </div>
    );
  }
}

export default function createSequenceInputPopup(props) {
  const { useEventPositioning } = props;

  let caretEl;
  if (useEventPositioning) {
    //we have to make a fake event here so that popper.js will position on the page correctly
    const { e, nodeToReFocus } = useEventPositioning;
    // e.persist();
    const top = e.clientY;
    const right = e.clientX;
    const bottom = e.clientY;
    const left = e.clientX;
    caretEl = {
      nodeToRefocus: nodeToReFocus,
      getBoundingClientRect: () => ({
        top,
        right,
        bottom,
        left
      }),
      clientWidth: 0,
      clientHeight: 0
    };
  }

  if (!caretEl || !caretEl === 0 || !isElementInViewport(caretEl)) {
    const activeEl = getActiveElement();
    if (activeEl) {
      caretEl = activeEl.querySelector(".veCaret");
    }
  }
  if (!caretEl || !caretEl === 0 || !isElementInViewport(caretEl)) {
    caretEl = getActiveElement();
  }
  if (!caretEl || !caretEl === 0 || !isElementInViewport(caretEl)) {
    caretEl = document.querySelector(".veCaret");
  }
  if (document.body.classList.contains("sequenceDragging")) {
    window.toastr.warning("Can't insert new sequence while dragging");
    //don't allow this
    return;
  }

  // function closeInput() {
  //   sequenceInputBubble.remove();
  // }
  activePopup?.close();
  const div = document.createElement("div");
  div.style.zIndex = "400000";
  div.id = "sequenceInputBubble";
  document.body.appendChild(div);

  if (!caretEl) {
    div.remove();
    return console.error(
      "there must be a caret element present in order to display the insertSequence popup"
    );
  }

  const root = createRoot(div);
  const popper = new Popper(caretEl, div, {
    placement: "bottom",
    modifiers: {
      offset: { offset: "94" }
    }
  });
  const popup = {
    close() {
      if (activePopup !== popup) return;
      activePopup = undefined;
      popper?.destroy();
      root.unmount();
      div.remove();
    }
  };
  activePopup = popup;
  flushSync(() => {
    root.render(
      <SequenceInputNoHotkeys
        closePopup={popup.close}
        nodeToReFocus={caretEl.nodeToRefocus || getNodeToRefocus(caretEl)}
        {...props}
      />
    );
  });
}

const getActiveElement = function (document) {
  document = document || window.document;

  // Check if the active element is in the main web or iframe
  if (
    document.body === document.activeElement ||
    /* eslint-disable eqeqeq*/

    document.activeElement.tagName == "IFRAME"
    /* eslint-enable eqeqeq*/
  ) {
    // Get iframes
    const iframes = document.getElementsByTagName("iframe");
    for (let i = 0; i < iframes.length; i++) {
      // Recall
      const focused = getActiveElement(iframes[i].contentWindow.document);
      if (focused !== false) {
        return focused; // The focused
      }
    }
  } else return document.activeElement;

  return false;
};

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight ||
        document.documentElement.clientHeight) /*or $(window).height() */ &&
    rect.right <=
      (window.innerWidth ||
        document.documentElement.clientWidth) /*or $(window).width() */
  );
}
