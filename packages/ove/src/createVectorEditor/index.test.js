import { act } from "react";
import { expect, test } from "bun:test";
import createVectorEditor from ".";

test("mounts, updates, and unmounts the standalone editor with React 19", async () => {
  const node = document.createElement("div");
  document.body.appendChild(node);

  let editor;
  await act(async () => {
    editor = createVectorEditor(node, {
      editorName: "React19Editor",
      hideStatusBar: true,
      showMenuBar: false
    });
    editor.updateEditor({
      sequenceData: {
        name: "React 19 plasmid",
        sequence: "atgcgatcgatc"
      }
    });
  });

  expect(node.querySelector(".veEditor")).not.toBeNull();
  expect(editor.getState().sequenceData.sequence).toBe("atgcgatcgatc");

  act(() => editor.close());
  expect(node.isConnected).toBe(false);
});
