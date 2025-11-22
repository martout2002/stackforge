import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 bg-[#0a0e1a]">
        <div 
          className="absolute inset-0 pixel-background"
          style={{ backgroundImage: "url('/landing_image.png')" }}
        />
        {/* Fade overlay on sides */}
        <div className="absolute inset-0 pixel-fade" />
      </div>
      
      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-8 md:px-16">
        <h1 className="pixel-title">
          Cauldron <span className="text-[#b4ff64]">2</span> Code
        </h1>
        <Link href="/configure">
          <button className="pixel-button">Build</button>
        </Link>
      </div>
    </div>
  );
}
