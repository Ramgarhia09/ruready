import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "8a2a4de2885b4a43a70ae145d97cd3e2";

let client = null;
let joined = false;
let joinInProgress = false;
let localTracks = [];

function getClient() {
  if (!client) {
    client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  }
  return client;
}

// Fetch token from Firebase Function
export async function fetchAgoraToken(channel) {
  const res = await fetch(
    `https://us-central1-r-u-ready-a306d.cloudfunctions.net/generateAgoraToken?channel=${channel}`
  );
  if (!res.ok) throw new Error("Token fetch failed");
  return res.json(); // { token, uid }
}

// JOIN (HARD-SAFE)
export async function joinAgora({ channel, isVideo }) {
  const client = getClient();

  if (joinInProgress) {
    console.warn("Join already in progress");
    return { client, localTracks };
  }

  if (joined && client.connectionState === "CONNECTED") {
    console.warn("Already joined the channel");
    return { client, localTracks };
  }

  joinInProgress = true;

  try {
    const { token, uid } = await fetchAgoraToken(channel);

    // Join channel
    await client.join(APP_ID, channel, token, uid);

    // Subscribe to remote users
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "video") user.videoTrack?.play("remote-player");
      if (mediaType === "audio") user.audioTrack?.play();
    });

    // Create local tracks safely
    if (isVideo) {
      try {
        localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracks[1]?.play("local-player");
      } catch (err) {
        console.error("Camera/Mic permission denied:", err);
        localTracks = [await AgoraRTC.createMicrophoneAudioTrack()];
      }
    } else {
      localTracks = [await AgoraRTC.createMicrophoneAudioTrack()];
    }

    // Publish tracks
    if (localTracks.length) await client.publish(localTracks);

    joined = true;
    console.log("Agora join success");
    return { client, localTracks };
  } catch (err) {
    console.error("Join Agora error:", err);
    throw err;
  } finally {
    joinInProgress = false;
  }
}


// Controls
export async function toggleMic(enabled) {
  if (localTracks[0]) await localTracks[0].setEnabled(enabled);
}

export async function toggleCamera(enabled) {
  if (localTracks[1]) await localTracks[1].setEnabled(enabled);
}

// LEAVE
export async function leaveAgora() {
  if (!client || !joined) return;

  try {
    localTracks.forEach(track => {
      track.stop();
      track.close();
    });
    localTracks = [];

    client.removeAllListeners();
    await client.leave();

    console.log("Left Agora channel successfully");
  } catch (err) {
    console.error("Error leaving Agora:", err);
  } finally {
    joined = false;
    joinInProgress = false;
  }
}



let currentCameraIndex = 0;

export async function switchCamera() {
  if (!localTracks[1]) return;

  const devices = await AgoraRTC.getCameras();
  if (devices.length < 2) {
    console.warn("No secondary camera found");
    return;
  }

  currentCameraIndex = (currentCameraIndex + 1) % devices.length;
  await localTracks[1].setDevice(devices[currentCameraIndex].deviceId);
}
