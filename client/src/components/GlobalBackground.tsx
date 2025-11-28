import { useState, useEffect } from "react";
import type { Settings } from "@shared/schema";

interface GlobalBackgroundProps {
  settings?: Settings | null;
}

export function GlobalBackground({ settings }: GlobalBackgroundProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const bgImage = settings?.globalBgImage;
  const isValidUrl = bgImage && typeof bgImage === 'string' && bgImage.trim().length > 0 && (bgImage.startsWith('http') || bgImage.startsWith('data:'));
  const shouldShow = isValidUrl && !imageFailed;

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10"
      style={{
        backgroundImage: shouldShow ? `url('${bgImage}')` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {shouldShow && (
        <img
          src={bgImage}
          alt="Global background"
          className="hidden"
          onError={() => setImageFailed(true)}
        />
      )}
    </div>
  );
}
