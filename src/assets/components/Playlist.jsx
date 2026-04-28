import React from "react";
import Tracklist from "./Tracklist";

export default function Playlist({
  playlistName,
  playlistTracks,
  onNameChange,
  onRemove,
  onSave,
}) {
  return (
    <section className="panel">
      <input
        className="playlist-name"
        value={playlistName}
        onChange={(event) => onNameChange(event.target.value)}
      />

      <Tracklist tracks={playlistTracks} onRemove={onRemove} isRemoval={true} />

      <button className="save-button" onClick={onSave}>
        Save To Spotify
      </button>
    </section>
  );
}