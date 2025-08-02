import type { FC } from 'react'

import classNames from 'classnames';

import styles from './Icon.module.scss';

interface IProps {
    src: string;
    className?: string;
}

const Icon: FC<IProps> = ({
    src,
    className,
}) => {
    return (
        <div
            className={classNames(className, styles.icon)}
            style={{
                maskImage: `url(${src})`,
                WebkitMaskImage: `url(${src})`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                background: 'currentColor',
                maskPosition: 'center',
                maskRepeat: 'no-repeat'
            }}
        />
    )
}

export default Icon;