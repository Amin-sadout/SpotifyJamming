import React, { useEffect, useState } from "react";
import "./App.css";

import SearchBar from "./assets/components/SearchBar";
import SearchResults from "./assets/components/SearchResults";
import Playlist from "./assets/components/Playlist";
import Spotify from "./assets/utils/Spotify";

export default function App() {
  const [searchResults, setSearchResults] = useState([]);

  const [playlistName, setPlaylistName] = useState("My Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Spotify.getAccessToken().catch((error) => {
      console.error(error);
    });
  }, []);

  const handleSearch = async (searchTerm) => {
    try {
      setMessage("Searching...");

      const results = await Spotify.search(searchTerm);

      setSearchResults(results);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while searching.");
    }
  };

  const addTrack = (trackToAdd) => {
    const alreadyExists = playlistTracks.some((track) => {
      return track.id === trackToAdd.id;
    });

    if (alreadyExists) {
      return;
    }

    setPlaylistTracks((currentTracks) => {
      return [...currentTracks, trackToAdd];
    });
  };

  const removeTrack = (trackToRemove) => {
    setPlaylistTracks((currentTracks) => {
      return currentTracks.filter((track) => {
        return track.id !== trackToRemove.id;
      });
    });
  };

  const updatePlaylistName = (newName) => {
    setPlaylistName(newName);
  };

  const savePlaylist = async () => {
    try {
      const trackUris = playlistTracks.map((track) => {
        return track.uri;
      });

      if (trackUris.length === 0) {
        setMessage("Add at least one track before saving.");
        return;
      }

      if (playlistName.trim() === "") {
        setMessage("Give your playlist a name first.");
        return;
      }

      setMessage("Saving playlist...");

      await Spotify.savePlaylist(playlistName, trackUris);

      setPlaylistName("New Playlist");
      setPlaylistTracks([]);
      setMessage("Playlist saved to Spotify!");
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  return (
    <div className="app">
      <h1>
  Ja<span>mmm</span>ing
</h1>

      <SearchBar onSearch={handleSearch} />

      {message && <p className="message">{message}</p>}

      <main className="main-layout">
        <SearchResults searchResults={searchResults} onAdd={addTrack} />

        <Playlist
          playlistName={playlistName}
          playlistTracks={playlistTracks}
          onNameChange={updatePlaylistName}
          onRemove={removeTrack}
          onSave={savePlaylist}
        />
      </main>
    </div>
  );
}
