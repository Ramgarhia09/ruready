import { useCall } from "../../context/CallContext";
import AudioCallUI from "./AudioCallUI";
import VideoCallUI from "./VideoCallUI";

export default function CallOverlay() {
  const { call } = useCall();

  // No active call → nothing to show
  if (!call) return null;
  if (!call.active) return null;

  // Safety: call type must exist
  if (!call.type) return null;

  switch (call.type) {
    case "audio":
      return <AudioCallUI />;

    case "video":
      return <VideoCallUI />;

    default:
      return null;
  }
}
