import React, { useEffect, useRef } from 'react';

import styles from './GameCanvas.module.scss';
import { observer } from 'mobx-react-lite';
import { gameState } from '@/state/gameState';

const GameCanvas: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gameState.gameApp.setCanvasWrapper(ref.current!);
    }, []);

    return (
        <div className={styles.gameCanvas} ref={ref}>
        </div>
    )
}

export default observer(GameCanvas);