import { useEffect } from "react";
import type { Settings } from "@shared/schema";

interface GlobalBackgroundProps {
  settings?: Settings | null;
}

export function GlobalBackground({ settings }: GlobalBackgroundProps) {
  const bgImage = settings?.globalBgImage;
  const isValidUrl = bgImage && typeof bgImage === 'string' && bgImage.trim().length > 0 && (bgImage.startsWith('http') || bgImage.startsWith('data:'));

  useEffect(() => {
    const htmlEl = document.documentElement;
    const bodyEl = document.body;

    if (isValidUrl) {
      // Set background on html element
      htmlEl.style.backgroundImage = `url('${bgImage}')`;
      htmlEl.style.backgroundSize = 'cover';
      htmlEl.style.backgroundPosition = 'center';
      htmlEl.style.backgroundAttachment = 'fixed';
      htmlEl.style.backgroundRepeat = 'no-repeat';
      // Mark body so CSS knows to be transparent
      bodyEl.setAttribute('data-global-bg', 'true');
    } else {
      htmlEl.style.backgroundImage = 'none';
      bodyEl.removeAttribute('data-global-bg');
    }

    return () => {
      htmlEl.style.backgroundImage = 'none';
      bodyEl.removeAttribute('data-global-bg');
    };
  }, [bgImage, isValidUrl]);

  return null;
}
