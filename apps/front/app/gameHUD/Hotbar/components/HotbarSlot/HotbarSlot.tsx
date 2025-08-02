import { useMemo, type FC } from "react";
import classNames from "classnames";

import styles from './HotbarSlot.module.scss';
import Image from "@/components/Image";
import { observer } from "mobx-react-lite";
import { gameState } from "@/state/gameState";

interface IProps {
    refToInventorySlot?: number;
    hotbarIndex: number;
}

const ShadowSlot: FC<IProps> = ({
    refToInventorySlot,
    hotbarIndex
}) => {
    

    return (
        <div className={classNames(styles.slot, {
            [styles.slot_active]: gameState.hotbar_active_slot === hotbarIndex
        })}>
            <Image
                className={styles.slot__image}
                src=""
                alt=""
            />
        </div>
    )
}

export default observer(ShadowSlot);