"use client";

import React, { useEffect } from "react";
import ReactDOM from "react-dom";

interface IProps {
  className?: string;
  el?: string;
  parent?: HTMLElement;
  getContent: () => React.ReactNode;
}

const Portal: React.FC<IProps> = ({
  className = "",
  el = "div",
  getContent,
  parent
}) => {
  const [container, setContainer] = React.useState<HTMLElement>();
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setContainer(parent ?? document.createElement(el))
  }, [el, parent])

  React.useEffect(() => {
    if(!container) {
      return;
    }

    if (className) container.classList.add(className);
    (document.body).appendChild(container);
    setIsMounted(true);
    return () => {
      (document.body).removeChild(container);
      setIsMounted(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container]);

  return !container || !isMounted ? null : ReactDOM.createPortal(getContent(), container);
};

export default Portal;
