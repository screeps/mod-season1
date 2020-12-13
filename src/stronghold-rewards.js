const _ = require('lodash'), q = require('q');

module.exports = function (config) {
    if(config.common) {
        const C = config.common.constants;
        config.common.strongholds.containerRewards = { score: 10, OH: 2, UL: 2, ZK: 2 };
        config.common.strongholds.containerAmounts = [0, 100, 500, 2000, 2000, 2000];

        config.common.strongholds.coreRewards = {
            [C.RESOURCE_UTRIUM]: [C.RESOURCE_SCORE, C.RESOURCE_SCORE, C.RESOURCE_UTRIUM_BAR, C.RESOURCE_UTRIUM_HYDRIDE, C.RESOURCE_UTRIUM_ACID, C.RESOURCE_CATALYZED_UTRIUM_ACID],
            [C.RESOURCE_LEMERGIUM]: [C.RESOURCE_SCORE, C.RESOURCE_SCORE, C.RESOURCE_LEMERGIUM_BAR, C.RESOURCE_LEMERGIUM_OXIDE, C.RESOURCE_LEMERGIUM_ALKALIDE, C.RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE],
            [C.RESOURCE_ZYNTHIUM]: [C.RESOURCE_SCORE, C.RESOURCE_SCORE, C.RESOURCE_ZYNTHIUM_BAR, C.RESOURCE_ZYNTHIUM_HYDRIDE, C.RESOURCE_ZYNTHIUM_ACID, C.RESOURCE_CATALYZED_ZYNTHIUM_ACID],
            [C.RESOURCE_KEANIUM]: [C.RESOURCE_SCORE, C.RESOURCE_SCORE, C.RESOURCE_KEANIUM_BAR, C.RESOURCE_KEANIUM_OXIDE, C.RESOURCE_KEANIUM_ALKALIDE, C.RESOURCE_CATALYZED_KEANIUM_ALKALIDE],
            [C.RESOURCE_OXYGEN]: [C.RESOURCE_SCORE, C.RESOURCE_SCORE, C.RESOURCE_OXIDANT, C.RESOURCE_HYDROXIDE, C.RESOURCE_GHODIUM_HYDRIDE, C.RESOURCE_GHODIUM_ACID],
            [C.RESOURCE_HYDROGEN]: [C.RESOURCE_SCORE, C.RESOURCE_SCORE, C.RESOURCE_REDUCTANT, C.RESOURCE_HYDROXIDE, C.RESOURCE_GHODIUM_HYDRIDE, C.RESOURCE_GHODIUM_ACID],
            [C.RESOURCE_CATALYST]: [C.RESOURCE_SCORE, C.RESOURCE_SCORE, C.RESOURCE_PURIFIER, C.RESOURCE_GHODIUM_OXIDE, C.RESOURCE_GHODIUM_ALKALIDE, C.RESOURCE_CATALYZED_GHODIUM_ALKALIDE],
        };
        config.common.strongholds.coreDensities = [3, 3, 5, 9, 15, 30];
        config.common.strongholds.coreAmounts = [0, 1000, 16000, 60000, 400000, 3000000]
    }

    if (config.cronjobs) {
        config.cronjobs.updateInvaderCore = [60, async ({utils}) => {
            const {db} = config.common.storage;
            const coresToUpdate = await db['rooms.objects'].find({type: 'invaderCore', depositType: {$nin: Object.keys(config.common.strongholds.coreRewards)}});
            for(let core of coresToUpdate) {
                const mineral = await db['rooms.objects'].findOne({type: 'mineral', room: core.room});
                if(!mineral) {
                    console.log(`ERR Mineral not found in ${core.room}`);
                    continue;
                }
                await db['rooms.objects'].update({_id: core._id}, {$set: {depositType: mineral.mineralType}})
            }
        }];

    }
};
