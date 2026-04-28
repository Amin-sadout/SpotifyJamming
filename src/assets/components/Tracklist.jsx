import React from "react";
import Track from "./Track";

export default function Tracklist({ tracks, onAdd, onRemove, isRemoval }) {
  return (
    <div className="tracklist">
      {tracks.length === 0 ? (
        <p className="empty-message">No tracks yet.</p>
      ) : (
        tracks.map((track) => {
          return (
            <Track
              key={track.id}
              track={track}
              onAdd={onAdd}
              onRemove={onRemove}
              isRemoval={isRemoval}
            />
          );
        })
      )}
    </div>
  );
}