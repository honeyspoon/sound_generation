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

const letters = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const firstNoteFreq = 8.175799;
const step = Math.pow(2, 1 / 12);

function freqToNote(freq) {
  // TODO: simplify this
  const note = Math.log(freq / firstNoteFreq) / Math.log(step);
  const noteInt = Math.round(note);

  return noteInt;
}

function noteToFreq(note) {
  const freq = Math.pow(step, note) * firstNoteFreq;
  return freq;
}

function noteToLetter(note) {
  const octave = Math.floor(note / letters.length) - 1;
  const letterPos = Math.floor(note % letters.length);
  const letter = letters[letterPos];

  return letter + octave;
}

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
  const maxF = 10000;

  useEffect(() => {
    let out_left = el.mul(0.5, el.cycle(f));
    let out_right = el.mul(0.4, el.cycle(f));
    // core.render(out_left, out_right);
  }, [f]);

  return (
    <div>
      <p>
        {f} | {freqToNote(f)} | {noteToLetter(freqToNote(f))}
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
      {Array(128)
        .fill()
        .map((_, i) => (
          <div key={i}>
            {i}: {noteToFreq(i)} | {noteToLetter(i)}
          </div>
        ))}
    </div>
  );
}

export default App;
