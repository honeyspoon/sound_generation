import "./App.css";

import React, { useState, useEffect, useCallback, useRef } from "react";

import {
  // ElementaryPluginRenderer as core,
  ElementaryWebAudioRenderer as core,
  el,
} from "@nick-thompson/elementary";

import debounce from "lodash.debounce";

core.on("error", (e: unknown) => {
  console.log(e);
});

core.on("load", (e) => {
  console.log("loaded", e);
});

function App() {
  const [f, setF] = useState(440);
  const [sliderF, setSliderF] = useState(f);

  const debouncedSave = useRef(
		debounce(nextValue => setF(nextValue), 1000),
	).current;

  useEffect(() => {
    let out_left = el.mul(0.5, el.cycle(f));
    let out_right = el.mul(0.4, el.cycle(f));
    console.log("new f", f);
    core.render(out_left, out_right);
  }, [f]);

  return (
    <div>
      <p>hey</p>
      <p>
        {f} | {sliderF}
        <input
          type="range"
          min="1"
          max="21000"
          value={sliderF}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setSliderF(val);
            debouncedSave(sliderF);
          }}
        />
      </p>
    </div>
  );
}

export default App;
