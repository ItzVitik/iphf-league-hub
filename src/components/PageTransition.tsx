import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState("animate-fade-in");
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      setTransitionStage("animate-fade-out");
      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage("animate-fade-in");
        prevPath.current = location.pathname;
        window.scrollTo(0, 0);
      }, 150);
      return () => clearTimeout(timeout);
    } else {
      setDisplayChildren(children);
    }
  }, [children, location.pathname]);

  return (
    <div className={transitionStage} style={{ animationDuration: "0.2s" }}>
      {displayChildren}
    </div>
  );
};

export default PageTransition;
