module.exports = {
    calculations: [
    ],
    processors: [
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
                {
                    action: 'Repeat',
                    params: [{
                        action: 'Sequence',
                        params: [
                            [
                                {
                                    action: 'ScaleTo',
                                    params: [
                                        1.5,
                                        1.5,
                                        0.3,
                                    ],
                                },
                                {
                                    action: 'ScaleTo',
                                    params: [
                                        1,
                                        1,
                                        1,
                                    ],
                                },
                            ],
                        ],
                    }],
                },
            ],
        },
        {
            type: 'sprite',
            once: true,
            payload: {
                parentId: 'mainContainer',
                texture: 'score-container',
                width: 70,
                height: 70,
            },
        },
        {
            id: 'light',
            type: 'sprite',
            layer: 'lighting',
            once: true,
            payload: {
                texture: 'glow',
                width: 300,
                height: 300,
                alpha: 1,
                tint: 0xAAAAFF,
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
        {
            id: 'moveTo',
            props: ['x', 'y'],
            actions: [{
                action: 'Ease',
                params: [
                    {
                        action: 'MoveTo',
                        params: [
                            { $state: 'x', koef: 100 },
                            { $state: 'y', koef: 100 },
                            { $processorParam: 'tickDuration' },
                        ],
                    },
                    'EASE_IN_OUT_QUAD',
                ],
            }],
        }
    ],
    zIndex: 5,
};
