import React, { use, useCallback, useRef } from "react";
import classNames from "classnames";

import Icon from "../Icon";
import { FormContext } from "../Form/Form";

import { hapticFeedback, isTMA } from "@telegram-apps/sdk";

import styles from "./Button.module.scss";

interface IProps {
  variant?: "fill" | "outline" | "default";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
  icon?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const longPressDelay = 1000

const Button: React.FC<React.PropsWithChildren<IProps>> = ({
  children,
  icon,
  variant = "fill",
  size = "md",
  onClick,
  onLongPress,
  className,
  disabled,
  type = "button",
}) => {
  const { isValid, isPending } = use(FormContext);

  const timerRef = useRef<NodeJS.Timeout>(null);
  const isLongPress = useRef<boolean>(false);

  // Обработчик начала нажатия
  const handlePressStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      console.log("handlePressStart");

      e.preventDefault();

      isLongPress.current = false;

      timerRef.current = setTimeout(() => {
        isLongPress.current = true;
        if (onLongPress) {
          if (isTMA()) {
            if (hapticFeedback.impactOccurred.isAvailable()) {
              hapticFeedback.impactOccurred("medium");
            }
          }
        }
      }, longPressDelay);
    },
    [onLongPress, longPressDelay]
  );

  // Обработчик окончания нажатия
  const handlePressEnd = useCallback(() => {
    console.log("handlePressEnd");
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (isLongPress.current && onLongPress) {
      onLongPress();
      return;
    }

    if (!isLongPress.current && onClick) {
      onClick();
      return;
    }
  }, [onClick]);

  const handlePressCancel = useCallback(() => {
    console.log("handlePressCancel");
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [onClick]);

  // Очистка таймера при размонтировании
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <button
      className={classNames(
        className,
        styles.button,
        styles[`button_${variant}`],
        styles[`button_${size}`],
        {
          [styles.button_longPress]: !!onLongPress,
        }
      )}
      onPointerDown={handlePressStart}
      onPointerUp={handlePressEnd}
      onPointerCancel={handlePressCancel}
      onContextMenu={(e) => {
        e.preventDefault();
        return false;
      }}
      disabled={isPending ? true : isValid ? disabled : true}
      type={type}
    >
      <div className={styles.button__content}>
        {icon && <Icon src={icon} className={styles.button__icon} />}

        {children}
      </div>
    </button>
  );
};

export default Button;
