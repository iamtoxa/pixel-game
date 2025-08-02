import { IsometricObject } from "./Object";

export const registryInit = async () => {
    await IsometricObject.registerAsset('box', {
        sprites: [
            {
                textureKey: 'assets/block.png',
                offsetX: 0,
                offsetY: 0,
                offsetZ: 0,
                width: 1,
                height: 1,
                depth: 1,
                layer: 'base',
                sortPriority: 0
            }
        ]
    });
}


// IsometricObject.registerAsset('character', {
//     sprites: [
//         {
//             textureKey: 'character_body',
//             offsetX: 0,
//             offsetY: 0,
//             offsetZ: 0,
//             width: 1,
//             height: 1,
//             depth: 1,
//             layer: 'body',
//             sortPriority: 0
//         },
//         {
//             textureKey: 'character_head',
//             offsetX: 0,
//             offsetY: 0,
//             offsetZ: 1, // Голова выше тела
//             width: 1,
//             height: 1,
//             depth: 0.5,
//             layer: 'head',
//             sortPriority: 1
//         }
//     ]
// });

// IsometricObject.registerAsset('tree', {
//     sprites: [
//         {
//             textureKey: 'tree_trunk',
//             offsetX: 0,
//             offsetY: 0,
//             offsetZ: 0,
//             width: 1,
//             height: 1,
//             depth: 2,
//             layer: 'trunk'
//         },
//         {
//             textureKey: 'tree_crown',
//             offsetX: 0,
//             offsetY: 0,
//             offsetZ: 2,
//             width: 3,
//             height: 3,
//             depth: 2,
//             layer: 'crown'
//         }
//     ]
// });