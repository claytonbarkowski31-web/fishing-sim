export const CONFIG = {
    PLAYER: {
        MOVE_SPEED: 5,
        JUMP_FORCE: 10,
        GROUND_LEVEL: 0
    },
    FISHING: {
        CAST_POWER_SPEED: 1.5,
        MAX_CAST_DISTANCE: 25,
        BITE_TIME_MIN: 2000,
        BITE_TIME_MAX: 7000,
        HOOK_WINDOW: 1500, // ms to react to bite
        REEL_SPEED: 0.1, // Reduced for difficulty
        TENSION_INCREASE: 0.15,
        TENSION_DECREASE: 0.05,
        TENSION_FAIL_LIMIT: 0.9,
        REEL_DIFFICULTY_FACTOR: 0.8 // Fish pulls back more
    },
    FISH_TYPES: [
        { id: 'trout', name: 'Rainbow Trout', weightRange: [0.5, 3.5], rarity: 0.7, texture: 'assets/trout-fish.webp', value: 10 },
        { id: 'bass', name: 'Largemouth Bass', weightRange: [1.0, 8.0], rarity: 0.3, texture: 'assets/bass-fish.webp', value: 25 }
    ],
    SHOP: {
        ITEMS: [
            { id: 'advanced_rod', name: 'Advanced Rod', price: 100, bonus: { reelSpeed: 0.05 } },
            { id: 'heavy_lure', name: 'Heavy Lure', price: 50, bonus: { biteRate: 0.2 } }
        ]
    }
};
