import Image from 'next/image';
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="w-full h-screen mx-auto bg-black flex flex-col items-center justify-center px-4 gap-8">
      <h1 className="text-white text-xl md:text-4xl font-bold text-center">
        The AI Agents For Personal Growth
      </h1>
      
      <div className="relative w-1/2 max-w-md aspect-square">
        <Image 
          src="/wei-square.png" 
          alt="logo" 
          fill
          priority
          className="object-contain"
        />
      </div>

      <div className="flex flex-row gap-6 w-full max-w-xs mx-auto justify-center">
        <Button variant="default" size="lg">
          Join Waitlist
        </Button>
      </div>
    </div>
  );
}
