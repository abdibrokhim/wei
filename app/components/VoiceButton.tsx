import React from "react";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Microphone } from "@phosphor-icons/react/dist/ssr";

interface VoiceButtonProps {
  isListening: boolean;
  isConnected: boolean;
  onStart: () => void;
  onStop: () => void;
  onClose: () => void;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  onClose,
}) => {
  // This button now only triggers the voice mode rather than directly handling voice interaction
  const handleActivateVoice = () => {
    onClose(); // Use the onClose prop to toggle voice mode on
  };

  return (
    <div className="fixed bottom-18 md:bottom-4 right-4 flex flex-col items-end gap-2 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleActivateVoice}
              variant="default"
              size="icon"
              className="rounded-full w-10 h-10 shadow-lg"
            >
              <Microphone className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>AI Voice Agent</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default VoiceButton; 