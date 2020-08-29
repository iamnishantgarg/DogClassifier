import React, { useReducer, useState, useRef } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";
// import "@tensorflow/tfjs";
import "./app.css";

const stateMachine = {
  initial: "initial",
  states: {
    initial: { on: { next: "loadingModel" } },
    loadingModel: { on: { next: "awaitingUpload" } },
    awaitingUpload: { on: { next: "ready" } },
    ready: { on: { next: "classifying" }, showImage: true },
    classifying: { on: { next: "complete" } },
    complete: { on: { next: "awaitingUpload" }, showImage: true },
  },
};

const reducer = (currentState, event) =>
  stateMachine.states[currentState].on[event] || stateMachine.initial;

const App = () => {
  const [model, setModel] = useState(null);
  const [state, dispatch] = useReducer(reducer, stateMachine.initial);
  const next = () => dispatch("next");
  const loadModel = async () => {
    try {
      next();
      const mobilenetModel = await mobilenet.load();
      setModel(mobilenetModel);
      next();
    } catch (error) {
      console.log(error);
    }
  };
  const buttonProps = {
    initial: {
      text: "Load Model",
      action: loadModel,
    },
    loadingModel: {
      text: "Loading model...",
      action: () => {},
    },
    awaitingUpload: { text: "Upload photo", action: () => {} },
    ready: { text: "Identify", action: () => {} },
    classifying: { text: "Identifying", action: () => {} },
    complete: { text: "Reset", action: () => {} },
  };
  return (
    <div className="App">
      <input type="file" accept="image/*" capture="camera" />
      <button onClick={buttonProps[state].action}>
        {buttonProps[state].text}
      </button>
    </div>
  );
};

export default App;
