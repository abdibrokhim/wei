import Image from 'next/image';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { CaretRight, GithubLogo } from '@phosphor-icons/react/dist/ssr';

export default function HomePage() {
  return (
    <div className="w-full h-screen mx-auto bg-black flex flex-col items-center justify-center px-4 gap-8">
      <h1 className="text-white text-xl md:text-3xl font-bold text-center">
        The AI Agents For Personal Growth
      </h1>
      
      <div className="relative w-1/2 max-w-md aspect-square">
        <Image 
          src="/wei-square.png" 
          alt="logo" 
          fill
          className="object-contain"
        />
      </div>

      <p className="text-white text-sm md:text-lg text-center italic">hey, i'm Wei - “helping you form good habits...”</p>

      <div className="flex flex-row gap-6 w-full max-w-xs mx-auto justify-center">
        <Button 
          variant="outline" 
          size="lg"
        >
          <Link href="https://github.com/abdibrokhim/wei" target="_blank" className='flex flex-row gap-1 items-center'>
            <GithubLogo className="size-4" />
            <span>Open Source</span>
          </Link>
        </Button>
        <Button 
          variant="default" 
          size="lg"
        >
          <Link href="/dashboard" className='flex flex-row gap-1 items-center'>
            <span>Try Now</span>
            <CaretRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
