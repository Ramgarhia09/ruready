import { useEffect, useRef, useState } from "react";
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Minus } from "lucide-react";
import { useCall } from "../../context/CallContext";
import { useAuth } from "../../context/AuthContext";
import { joinAgora, leaveAgora, toggleMic } from "../../services/AgoraService";

export default function AudioCallUI() {
  const { call, endCall, setCall } = useCall();
  const { user } = useAuth();

  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [minimized, setMinimized] = useState(false);

  const joinedRef = useRef(false);
  const ringtoneRef = useRef(null);

  if (!call || !user) return null;

  const isReceiver = call.receiverId === user.uid;
  const otherUser = isReceiver ? call.caller : call.receiver;

  /* =======================
     START CALL
  ======================== */
  const startCall = async () => {
    if (joinedRef.current) return;
    joinedRef.current = true;

    try {
      await joinAgora({ channel: call.callId, isVideo: false });
    } catch (e) {
      joinedRef.current = false;
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isReceiver) startCall();

    return () => {
      leaveAgora();
      joinedRef.current = false;
    };
    // eslint-disable-next-line
  }, []);

  /* =======================
     RINGTONE (INCOMING)
  ======================== */
  useEffect(() => {
    if (isReceiver && call && !call.pickedUp) {
      ringtoneRef.current?.play().catch(() => {});
    } else {
      ringtoneRef.current?.pause();
      if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;
    }

    return () => ringtoneRef.current?.pause();
  }, [call?.pickedUp, isReceiver]);

  /* =======================
     ACCEPT CALL
  ======================== */
  const acceptCall = async () => {
    ringtoneRef.current?.pause();
    setCall({ ...call, pickedUp: true });
    await startCall();
  };

  /* =======================
     TIMER
  ======================== */
  useEffect(() => {
    if (!call.pickedUp) return;

    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [call.pickedUp]);

  const formatTime = () => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* =======================
     MIC
  ======================== */
  const handleMic = async () => {
    await toggleMic(!micOn);
    setMicOn(!micOn);
  };

  /* =======================
     SPEAKER
  ======================== */
  const toggleSpeaker = () => {
    document.querySelectorAll("audio").forEach((a) => (a.muted = speakerOn));
    setSpeakerOn(!speakerOn);
  };

  /* =======================
     END CALL
  ======================== */
  const handleEnd = async (callStatus = "completed") => {
    ringtoneRef.current?.pause();
    await leaveAgora();
    endCall(callStatus, seconds);
    joinedRef.current = false;
  };

  const statusText = () => {
    if (!call.pickedUp && isReceiver) return "Incoming audio call";
    if (!call.pickedUp && !isReceiver) return "Calling…";
    return formatTime();
  };

  return (
    <>
      {/* RINGTONE */}
      <audio ref={ringtoneRef} loop src="/sounds/ringtone.mp3" />

      <div
        className={`fixed z-[999] text-white transition-all duration-300
        ${
          minimized
            ? "bottom-4 right-4 w-72 h-32 rounded-xl bg-black/80"
            : "inset-0 bg-gradient-to-b from-black via-gray-900 to-black"
        }
        flex flex-col items-center justify-between py-6`}
      >
        {/* TOP INFO */}
        <div className="relative text-center w-full">
          <button
            onClick={() => setMinimized(!minimized)}
            className="absolute top-2 right-4 p-2 bg-white/10 rounded-full"
          >
            <Minus />
          </button>

          <h2 className="text-2xl font-semibold">
            {otherUser?.displayName || "Unknown"}
          </h2>
          <p className="text-sm text-white/70 mt-1">{statusText()}</p>
        </div>

        {/* AVATAR */}
        {!minimized && (
          <div className="relative mt-10">
            <div className="absolute inset-0 rounded-full animate-pulse bg-green-500/20"></div>
            <img
              src={otherUser?.photoURL}
              className="relative w-40 h-40 rounded-full border-4 border-white/20 object-cover"
              alt=""
            />
          </div>
        )}

        {/* CONTROLS */}
        <div className="flex gap-6 bg-black/60 px-8 py-4 rounded-full backdrop-blur-md">
          {isReceiver && !call.pickedUp ? (
            <>
              <button
                onClick={acceptCall}
                className="px-6 py-3 bg-green-600 rounded-full"
              >
                Accept
              </button>
              <button
                onClick={() => handleEnd("rejected")}
                className="px-6 py-3 bg-red-600 rounded-full"
              >
                Reject
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleMic}
                className={`p-4 rounded-full ${
                  micOn ? "bg-white/20" : "bg-red-500"
                }`}
              >
                {micOn ? <Mic /> : <MicOff />}
              </button>

              <button
                onClick={toggleSpeaker}
                className={`p-4 rounded-full ${
                  speakerOn ? "bg-white/20" : "bg-red-500"
                }`}
              >
                {speakerOn ? <Volume2 /> : <VolumeX />}
              </button>

              <button
                onClick={() => handleEnd("completed")}
                className="p-4 rounded-full bg-red-600"
              >
                <PhoneOff />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
