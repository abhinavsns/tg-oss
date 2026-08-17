import React, { act } from "react";
import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { combineReducers, createStore } from "redux";
import { Field, reducer as formReducer, reduxForm } from "redux-form";

let fieldInput;
const Input = ({ input }) => {
  fieldInput = input;
  return <input aria-label="Name" {...input} />;
};
const Form = reduxForm({ form: "react19" })(() => (
  <form>
    <Field component={Input} name="name" />
  </form>
));

test("redux-form fields work with React 19, React Redux 9, and Redux 5", () => {
  const store = createStore(combineReducers({ form: formReducer }));
  render(
    <Provider store={store}>
      <Form />
    </Provider>
  );

  act(() => fieldInput.onChange("plasmid"));

  expect(store.getState().form.react19.values.name).toBe("plasmid");
});
