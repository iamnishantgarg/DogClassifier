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

const formatResult = ({ className, probability }) => {
  return (
    <li key={className}>{`${className}:${(probability * 100).toFixed(2)}%`}</li>
  );
};

const reducer = (currentState, event) =>
  stateMachine.states[currentState].on[event] || stateMachine.initial;

const App = () => {
  const [model, setModel] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [results, setResults] = useState([]);

  const [state, dispatch] = useReducer(reducer, stateMachine.initial);
  const next = () => dispatch("next");
  const inputRef = useRef();
  const imageRef = useRef();

  const loadModel = async () => {
    next();
    const mobilenetModel = await mobilenet.load();
    setModel(mobilenetModel);
    next();
  };
  const identify = async () => {
    next();
    const results = await model.classify(imageRef.current);
    setResults(results);
    next();
  };
  const handleReset = () => {
    setResults([]);
    next();
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
    awaitingUpload: {
      text: "Upload photo",
      action: () => inputRef.current.click(),
    },
    ready: {
      text: "Identify",
      action: identify,
    },
    classifying: { text: "Identifying", action: () => {} },
    complete: { text: "Reset", action: handleReset },
  };

  const handleUpdate = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setImageUrl(url);
      next();
    }
  };
  const { showImage = false } = stateMachine.states[state];
  // console.log(results);
  return (
    <div className="App">
      {showImage && <img src={imageUrl} alt="Upload-Preview" ref={imageRef} />}
      {results.length > 0 && (
        <ul>{results.map((result) => formatResult(result))}</ul>
      )}

      <input
        type="file"
        accept="image/*"
        capture="camera"
        ref={inputRef}
        onChange={handleUpdate}
      />
      <button onClick={buttonProps[state].action}>
        {buttonProps[state].text}
      </button>
    </div>
  );
};

export default App;
