import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import {
  // ElementaryPluginRenderer as core,
  ElementaryWebAudioRenderer as core,
  el,
} from "@nick-thompson/elementary";

let ctx = new AudioContext();

function RenderApp(root) {
  console.log(ctx);
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    root
  );
}

core.on("load", () => {
  const root = document.getElementById("root");
  if (ctx.state !== "running") {
    ReactDOM.render(
      <React.StrictMode>
        <div> loading ... </div>
        <button onClick={() => ctx.resume().then(() => RenderApp(root))}>
          load
        </button>
      </React.StrictMode>,
      root
    );
  } else {
    RenderApp(root);
  }
});

reportWebVitals();

async function main() {
  let node = await core.initialize(ctx, {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [2],
  });
  node.connect(ctx.destination);
}

main();
