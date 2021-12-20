import "./App.css";

import React, { useState, useEffect, useRef } from "react";

import { debounce, wrap } from "lodash";

import {
  // ElementaryPluginRenderer as core,
  ElementaryWebAudioRenderer as core,
  el,
} from "@nick-thompson/elementary";

core.on("error", (e) => {
  console.log(e);
});

core.on("load", () => {
  core.on("midi", (e) => {
    console.log(e);
  });
});

const silence = el.mul(0, el.cycle(0));

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
  return freq.toFixed(2);
}

function noteToLetter(note) {
  const octave = Math.floor(note / letters.length) - 1;
  const letterPos = Math.floor(note % letters.length);
  const letter = letters[letterPos];

  return letter + octave;
}

function RangeSlider({ min, max, step, initial, onChange, delay, isLog }) {
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

function synthVoice({ key, gate, freq }) {
  const env = el.adsr(
    4.0,

    1.0,
    0.4,
    2.0,
    el.const({ key: `${key}:gate`, gate })
  );

  const f = parseFloat(freq);

  // return el.mul(env, el.cycle(el.const({ key: `${key}:freq`, f })));
  return el.mul(env, el.cycle(f));
}

function Footer() {
  return (
    <div>
      Abderahmane Bouziane <a href="https://github.com/hnspn/music">@hnspn</a>
    </div>
  );
}

function App() {
  return (
    <div>
      <h1>music dashboard</h1>
      <FreqSlider />
      <NoteList />
      <Footer />
    </div>
  );
}

function Collapsible({ initial, children }) {
  const [collapsed, setCollapsed] = useState(initial);
  return (
    <div>
      <button onClick={() => setCollapsed((collapsed) => !collapsed)}>
        {collapsed ? "-" : "+"}
      </button>
      {collapsed ? children : ""}
    </div>
  );
}

function FreqSlider() {
  const [f, setF] = useState(440);
  const [play, setPlay] = useState(false);

  const minF = 20;
  const maxF = 10000;

  useEffect(() => {
    let out = el.mul(0.4, el.cycle(f));
    if (!play) {
      out = el.mul(0, out);
    }
    core.render(out, out);
  }, [f, play]);

  return (
    <>
      <h2>slider</h2>
      <p>
        {f} | {freqToNote(f)} | {noteToLetter(freqToNote(f))}
        <RangeSlider
          min={minF}
          max={maxF}
          initial={f}
          step={step}
          isLog={true}
          delay={300}
          onChange={setF}
        />
      </p>
      <button onClick={() => setPlay((play) => !play)}>
        {play ? "pause" : "play"}
      </button>
    </>
  );
}

function NoteList() {
  const [notes, setNotes] = useState([]);

  function addNote(gate, freq) {
    setNotes((notes) => [...notes, { key: `${Date.now()}`, gate, freq }]);
  }

  function removeNote(freq) {
    setNotes((notes) => notes.filter((n) => n.freq !== freq));
  }

  function clearNotes() {
    setNotes([]);
  }

  useEffect(() => {
    if (notes.length) {
      const synthVoices = notes.map(synthVoice);
      const out = el.add(synthVoices);
      core.render(out, out);
    } else {
      core.render(silence, silence);
    }
  }, [notes]);

  return (
    <div>
      <h2>Notes on </h2>
      {notes.map(({ freq }) => (
        <div key={freq}>
          {noteToLetter(freqToNote(freq))}
          <button onClick={() => removeNote(freq)}>-</button>
        </div>
      ))}
      <h2>enveloppe</h2>
      <div>attack: 4.0, delay: 1.0, sustain: 0.4, release: 2.0,</div>
      <button onClick={clearNotes}>clear</button>
      <h2>List</h2>
      <Collapsible initial="true">
        {Array(128)
          .fill()
          .map((_, i) => (
            <div key={i}>
              {i}: {noteToFreq(i)} | {noteToLetter(i)}|
              <button onClick={() => addNote(0.4, noteToFreq(i))}> add </button>
              <button onClick={() => removeNote(noteToFreq(i))}>
                {" "}
                remove{" "}
              </button>
              <button
                onClick={() => {
                  const f = noteToFreq(i);
                  addNote(0.1, f);
                  setTimeout(() => {
                    removeNote(f);
                  }, 500);
                }}
              >
                play
              </button>
            </div>
          ))}
      </Collapsible>
    </div>
  );
}

export default App;
