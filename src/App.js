import "./App.css";

import React, { useState, useEffect, useRef } from "react";

import { debounce } from "lodash";

import {
  // ElementaryPluginRenderer as core,
  ElementaryWebAudioRenderer as core,
  el,
} from "@nick-thompson/elementary";

core.on("error", (e) => {
  console.log(e);
});

core.on("load", (e) => {
  core.on("midi", (e) => {
    console.log(e);
  });
});

function DebouncedRangeSlider({
  min,
  max,
  step,
  initial,
  onChange,
  delay,
  isLog,
}) {
  const [value, setValue] = useState(Math.log(initial));
  const debouncedSave = useRef(
    debounce((v) => {
      return onChange(isLog ? Math.exp(v) : v);
    }, delay)
  ).current;

  return (
    <input
      type="range"
      min={isLog ? Math.log(min) : min}
      max={isLog ? Math.log(max) : max}
      value={value}
      step={isLog ? Math.log(step) : step}
      onChange={(e) => {
        const val = parseFloat(e.target.value);
        setValue(val);
        debouncedSave(value);
      }}
    />
  );
}

function App() {
  const [f, setF] = useState(440);

  const minF = 20;
  const maxF = 21000;

  const step = Math.pow(2, 1 / 12);

  useEffect(() => {
    let out_left = el.mul(0.5, el.cycle(f));
    let out_right = el.mul(0.4, el.cycle(f));
    core.render(out_left, out_right);
  }, [f]);

  return (
    <div>
      <p>
        {f}
        <DebouncedRangeSlider
          min={minF}
          max={maxF}
          initial={f}
          step={step}
          isLog={true}
          delay={300}
          onChange={(v) => {
            setF(v);
          }}
        />
      </p>
    </div>
  );
}

export default App;
