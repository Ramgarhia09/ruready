import { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

export default function useAgora(appId) {
  const clientRef = useRef(null);
  const [joined, setJoined] = useState(false);
  const [localTracks, setLocalTracks] = useState([]);

  useEffect(() => {
    clientRef.current = AgoraRTC.createClient({
      mode: "rtc",
      codec: "vp8",
    });
  }, []);

  const joinChannel = async (channelName, uid) => {
    const res = await fetch(
      `https://us-central1-r-u-ready-a306d.cloudfunctions.net/generateAgoraToken?channelName=${channelName}&uid=${uid}`
    );
    const { token } = await res.json();

    const client = clientRef.current;

    await client.join(appId, channelName, token, uid);

    const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
    setLocalTracks(tracks);
    await client.publish(tracks);

    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "video") user.videoTrack.play("remote-video");
      if (mediaType === "audio") user.audioTrack.play();
    });

    setJoined(true);
  };

  const leaveChannel = async () => {
    localTracks.forEach((t) => t.close());
    await clientRef.current.leave();
    setJoined(false);
  };

  return { joined, joinChannel, leaveChannel };
}
