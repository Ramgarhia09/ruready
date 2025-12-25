import { useEffect, useRef, useState } from "react";
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  RotateCw,
  Minus,
} from "lucide-react";
import { useCall } from "../../context/CallContext";
import { useAuth } from "../../context/AuthContext";
import {
  joinAgora,
  leaveAgora,
  toggleMic,
  toggleCamera,
  switchCamera,
} from "../../services/AgoraService";

export default function VideoCallUI() {
  const { call, endCall, setCall } = useCall();
  const { user } = useAuth();

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [minimized, setMinimized] = useState(false);

  const joinedRef = useRef(false);
  const ringAudioRef = useRef(null);

  if (!call || !user) return null;

  const isReceiver = call.receiverId === user.uid;
  const otherUser = isReceiver ? call.caller : call.receiver;

  /* ---------------- CALL TIMER ---------------- */
  useEffect(() => {
    if (!call.pickedUp) return;

    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [call.pickedUp]);

  const formatTime = () =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`;

  /* ---------------- RING TONE ---------------- */
  useEffect(() => {
    // Play ringtone only if incoming call and not picked up
    if (isReceiver && !call.pickedUp) {
      ringAudioRef.current = new Audio("/sounds/ringtone.mp3");
      ringAudioRef.current.loop = true;
      ringAudioRef.current.play().catch(() => {});
    }

    return () => {
      ringAudioRef.current?.pause();
      ringAudioRef.current = null;
    };
  }, [isReceiver, call.pickedUp]);

  /* ---------------- AGORA START ---------------- */
  const startVideo = async () => {
    if (joinedRef.current) return;
    joinedRef.current = true;
    await joinAgora({ channel: call.callId, isVideo: true });
  };

  useEffect(() => {
    if (!isReceiver) startVideo();
    return () => {
      leaveAgora();
      joinedRef.current = false;
    };
    // eslint-disable-next-line
  }, []);

  const acceptCall = async () => {
    ringAudioRef.current?.pause();
    setCall({ ...call, pickedUp: true });
    await startVideo();
  };

  const endHandler = async () => {
    ringAudioRef.current?.pause();
    await leaveAgora();
    joinedRef.current = false;
    endCall();
  };

  const statusText = () => {
    if (!call.pickedUp && isReceiver) return "Incoming video call";
    if (!call.pickedUp && !isReceiver) return "Calling…";
    return formatTime();
  };

  /* ---------------- MINIMIZED BUBBLE ---------------- */
  if (minimized) {
    return (
      <div
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-black border border-white/30 z-[9999] flex items-center justify-center shadow-xl cursor-pointer"
      >
        <img src={otherUser.photoURL} className="w-12 h-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[999] text-white">
      {/* REMOTE VIDEO */}
      <div id="remote-player" className="w-full h-full relative">
        {!camOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            <img src={otherUser.photoURL} className="w-28 h-28 rounded-full mb-4" />
            <p className="text-lg font-semibold">{otherUser.displayName}</p>
          </div>
        )}
      </div>

      {/* TOP BAR */}
      <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/70 to-transparent">
        <p className="text-lg font-semibold">{otherUser.displayName}</p>
        <p className="text-sm text-white/70">{statusText()}</p>
      </div>

      {/* LOCAL PREVIEW */}
      <div
        id="local-player"
        className="absolute bottom-24 right-4 w-32 h-44 bg-black border border-white/20 rounded-lg overflow-hidden flex items-center justify-center"
      >
        {!camOn && <img src={user.photoURL} className="w-20 h-20 rounded-full opacity-80" />}
      </div>

      {/* CONTROLS */}
      <div className="absolute bottom-6 w-full flex justify-center">
        {isReceiver && !call.pickedUp ? (
          <div className="flex gap-8">
            <button onClick={acceptCall} className="px-6 py-4 bg-green-600 rounded-full">
              Accept
            </button>
            <button onClick={endHandler} className="px-6 py-4 bg-red-600 rounded-full">
              Reject
            </button>
          </div>
        ) : (
          <div className="flex gap-5 bg-black/60 px-6 py-4 rounded-full backdrop-blur-md">
            {/* MIC */}
            <button
              onClick={async () => {
                await toggleMic(!micOn);
                setMicOn(!micOn);
              }}
              className={`p-3 rounded-full ${micOn ? "bg-white/20" : "bg-red-500"}`}
            >
              {micOn ? <Mic /> : <MicOff />}
            </button>

            {/* CAMERA */}
            <button
              onClick={async () => {
                await toggleCamera(!camOn);
                setCamOn(!camOn);
              }}
              className={`p-3 rounded-full ${camOn ? "bg-white/20" : "bg-red-500"}`}
            >
              {camOn ? <Video /> : <VideoOff />}
            </button>

            {/* SWITCH CAMERA */}
            <button onClick={switchCamera} className="p-3 rounded-full bg-white/20">
              <RotateCw />
            </button>

            {/* MINIMIZE */}
            <button onClick={() => setMinimized(true)} className="p-3 rounded-full bg-white/20">
              <Minus />
            </button>

            {/* END */}
            <button onClick={endHandler} className="p-3 rounded-full bg-red-600">
              <PhoneOff />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
