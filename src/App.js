import "./App.css";

import React, { useState, useEffect, useRef } from "react";
import debounce from "lodash.debounce";

import {
  // ElementaryPluginRenderer as core,
  ElementaryWebAudioRenderer as core,
  el,
} from "@nick-thompson/elementary";


core.on("error", (e) => {
  console.log(e);
});

core.on("load", (e) => {
  console.log("loaded", e);
});


function App() {
  const [f, setF] = useState(440);
  const [sliderF, setSliderF] = useState(Math.log(f));

  const minF = 20;
  const maxF = 21000;

  const step = Math.pow(2, 1/12);

  const debouncedSave = useRef(
		debounce(nextValue => setF(Math.exp(nextValue)), 500),
	).current;

  useEffect(() => {
    let out_left = el.mul(0.5, el.cycle(f));
    let out_right = el.mul(0.4, el.cycle(f));
    core.render(out_left, out_right);
  }, [f]);

  return (
    <div>
      <p>hey</p>
      <p>
        {f} | {sliderF}
        <input
          type="range"
          min={Math.log(minF)}
          max={Math.log(maxF)}
          value={sliderF}
          step={Math.log(step)}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setSliderF(val);
            debouncedSave(sliderF);
          }}
        />
      </p>
    </div>
  );
}

export default App;
