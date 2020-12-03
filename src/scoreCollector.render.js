module.exports = {
    calculations: [
    ],
    processors: [
        {
            type: 'sprite',
            once: true,
            payload: {
                texture: 'season-collector-body',
                width: 260,
                height: 260,
            },
        },
        {
            type: 'sprite',
            layer: 'lighting',
            once: true,
            payload: {
                texture: 'season-collector-body',
                width: 260,
                height: 260,
            },
        },
        {
            type: 'container',
            id: 'mainContainer',
            once: true,
            actions: [
                {
                    action: 'Repeat',
                    params: [
                        {
                            action: 'RotateBy',
                            params: [
                                Math.PI,
                                10,
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: 'sprite',
            once: true,
            payload: {
                parentId: 'mainContainer',
                texture: 'season-collector-core',
                width: 90,
                height: 90,
            },
        },
        {
            id: 'light',
            type: 'sprite',
            layer: 'lighting',
            once: true,
            payload: {
                texture: 'glow',
                width: 1200,
                height: 1200,
                alpha: 1,
                tint: 0x9999FF,
            },
            actions: [
                {
                    action: 'Repeat',
                    params: [
                        {
                            action: 'Sequence',
                            params: [
                                [
                                    {
                                        action: 'TintTo',
                                        params: [
                                            0xFFFF99,
                                            1,
                                        ],
                                    },
                                    {
                                        action: 'TintTo',
                                        params: [
                                            0x9999FF,
                                            1,
                                        ],
                                    },
                                ],
                            ],
                        },
                    ],
                },
            ],
        },
    ],
    actions: [
        {
            targetId: 'mainContainer',
        },
    ],
    zIndex: 4,
};
