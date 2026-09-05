import React, { useEffect, useState } from "react";
import SAYFLogo from "./SAYFLogo";
import { FrameCache } from "../utils/FrameCache";

interface LoadingScreenProps {
  onDone: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onDone }) => {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let isDone = false;
    let isMounted = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const finish = () => {
      if (isDone || !isMounted) return;
      isDone = true;
      setHidden(true);
      timers.push(setTimeout(() => {
        if (!isMounted) return;
        onDone();
        FrameCache.startBackgroundLoad();
      }, 650));
    };

    FrameCache.preloadCritical(5, (pct) => {
      if (!isDone && isMounted) setProgress(pct);
    }).then(() => {
      if (isMounted) timers.push(setTimeout(finish, 400));
    });

    // Fallback: dismiss after 3s regardless
    timers.push(setTimeout(() => {
      if (!isDone && isMounted) setProgress(100);
      if (isMounted) timers.push(setTimeout(finish, 300));
    }, 3000));

    return () => {
      isMounted = false;
      timers.forEach(clearTimeout);
    };
  }, [onDone]);

  return (
    <div className={`loading-screen${hidden ? " hidden" : ""}`} role="status" aria-label="Loading SAYF">
      <SAYFLogo width={140} />

      <div className="loading-progress-bar">
        <div
          className="loading-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
