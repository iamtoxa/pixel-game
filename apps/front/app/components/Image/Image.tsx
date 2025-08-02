/* eslint-disable @next/next/no-img-element */

import type { FC, ForwardedRef } from 'react'
import React, { forwardRef } from 'react';

import classNames from 'classnames';

import styles from './Image.module.scss';

interface IProps {
    src: string;
    alt: string;
    className?: string;
    onLoaded?: () => void;
}

const Image = forwardRef<HTMLImageElement, IProps>(({ src, alt, className, onLoaded }, ref) => {
    return (
        <img
            className={classNames(className, styles.image)}
            alt={alt}
            src={src || undefined}
            onLoad={onLoaded}
            ref={ref}
        />
    )
});

export default Image;