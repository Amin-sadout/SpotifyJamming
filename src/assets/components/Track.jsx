import React from "react";

export default function Track({ track, onAdd, onRemove, isRemoval }) {
  const handleClick = () => {
    if (isRemoval) {
      onRemove(track);
    } else {
      onAdd(track);
    }
  };

  return (
    <div className="track">
      <div className="track-info">
        <h3>{track.name}</h3>
        <p>
          {track.artist} | {track.album}
        </p>
      </div>

      <button className="track-action" onClick={handleClick}>
        {isRemoval ? "-" : "+"}
      </button>
    </div>
  );
}