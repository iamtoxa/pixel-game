import { useCallback, useEffect, useMemo, type FC } from "react";

import styles from './Hotbar.module.scss';
import ShadowSlot from "./components/ShadowSlot";
import { gameState } from "@/state/gameState";

const hotbarLength = 9;

const Hotbar: FC = () => {
    const slots = useMemo(() => {
        return ([...new Array(hotbarLength)]).map((_,index) => (
            <ShadowSlot
                key={index+1}
                hotbarIndex={index+1}
            />
        ))
    }, []);

    const onKeyDown = useCallback((ev: KeyboardEvent) => {
        const keyNum = Number.parseInt(ev.key);

        if(keyNum) {
            gameState.hotbar_active_slot = keyNum;
        }
    }, [])

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [])

    return (
        <div className={styles.hotbar}>
            {slots}
        </div>
    )
}

export default Hotbar;