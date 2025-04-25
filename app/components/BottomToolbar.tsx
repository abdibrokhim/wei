import React from "react";
import { SessionStatus } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface BottomToolbarProps {
  sessionStatus: SessionStatus;
  onToggleConnection: () => void;
  isPTTActive: boolean;
  isPTTUserSpeaking: boolean;
  handleTalkButtonDown: () => void;
  handleTalkButtonUp: () => void;
}

function BottomToolbar({
  sessionStatus,
  isPTTUserSpeaking,
  handleTalkButtonDown,
  handleTalkButtonUp,
}: BottomToolbarProps) {
  const isConnected = sessionStatus === "CONNECTED";

  return (
    <div className="p-4 flex justify-center items-center">
      {isConnected && (
        <div className="flex flex-col items-center gap-2">
          <Button
            onMouseDown={handleTalkButtonDown}
            onMouseUp={handleTalkButtonUp}
            onTouchStart={handleTalkButtonDown}
            onTouchEnd={handleTalkButtonUp}
            disabled={!isConnected}
            variant={isPTTUserSpeaking ? "destructive" : "default"}
            size="lg"
            className="rounded-full h-16 w-16 shadow-lg"
          >
            {isPTTUserSpeaking ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            {isPTTUserSpeaking ? "Release to stop recording" : "Hold to speak"}
          </p>
        </div>
      )}
    </div>
  );
}

export default BottomToolbar;
