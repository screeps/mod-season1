const _ = require('lodash');

module.exports = function(config) {
    if(config.common) {
        config.common.constants.FIND_SCORE_COLLECTORS = 10012;

        config.common.constants.SCORE_COLLECTOR_SINK = 20;
        config.common.constants.SCORE_COLLECTOR_MAX_CAPACITY = 20000;
    }

    if(config.backend) {
        config.backend.customObjectTypes.scoreCollector = {
            sidepanel: '<div><label>Free capacity:</label><span>{{object.storeCapacityResource.score}}</span></div>'
        };
        config.backend.renderer.resources['season-collector-core'] = `${config.assetsUrl}season1/season-collector-core.svg`;
        config.backend.renderer.resources['season-collector-body'] = `${config.assetsUrl}season1/season-collector-body.svg`;
        config.backend.renderer.metadata.scoreCollector = require('./scoreCollector.render');
    }

    if(config.engine) {
        config.engine.registerCustomObjectPrototype('scoreCollector', 'ScoreCollector', {
            properties: {
            },
            prototypeExtender (prototype, scope, {utils}) {
                const data = id => {
                    if (!scope.runtimeData.roomObjects[id]) {
                        throw new Error("Could not find an object with ID " + id);
                    }
                    return scope.runtimeData.roomObjects[id];
                };

                utils.defineGameObjectProperties(prototype, data, {
                    store: o => new scope.globals.Store(o)
                });
                prototype.toString = function() { return `[scoreCollector #${this.id}]` };
            },
            findConstant: config.common.constants.FIND_SCORE_COLLECTORS
        });

        config.engine.on('postProcessObject', function (object, roomObjects, roomTerrain, gameTime, roomInfo, bulk, bulkUsers, eventLog) {
            if(object.type == 'scoreCollector' && object.store) {
                const score = object.store.score || 0;
                const newCapacity = Math.min(
                    config.common.constants.SCORE_COLLECTOR_MAX_CAPACITY,
                    object.storeCapacityResource.score - score + config.common.constants.SCORE_COLLECTOR_SINK);
                if(object.store.score) {
                    bulk.update(object, {store: {score: 0}});
                }
                if(object.storeCapacityResource.score != newCapacity) {
                    bulk.update(object, {storeCapacityResource: {score: newCapacity}});
                }
                roomInfo.active = true;
            }
        });
        config.engine.on('processRoom', function(roomId, roomInfo, roomObjects, roomTerrain, gameTime, bulk, bulkUsers, eventLog) {
            if(!roomId.match(/0[NS]\d?0$/)) {
                return;
            }
            for(let event of eventLog) {
                if((event.event == config.common.constants.EVENT_TRANSFER) &&
                    (event.data.resourceType == config.common.constants.RESOURCE_SCORE) &&
                    roomObjects[event.data.targetId] &&
                    (roomObjects[event.data.targetId].type == 'scoreCollector')) {
                    const object = roomObjects[event.objectId];
                    if(object && object.user) {
                        bulkUsers.inc(object.user, 'score', event.data.amount);
                    }
                }
            }
        });
    }

    if (config.cronjobs) {
        config.cronjobs.genScoreCollectors = [365 * 24 * 60 * 60, async ({utils}) => {
            const {db, env} = config.common.storage;

            // run once
            if(await env.get('scoreCollectorsGenerated')) {
                return;
            }

            const critChance = 20;
            const critHits = 300000000;
            const min = 70000000;
            const max = 130000000;
            const radius = 5;

            const collectors = await db['rooms.objects'].find({type: 'scoreCollector'});
            const crossroads = await db['rooms'].find({_id: {$regex: '0[NS]\\d?0$'}});
            for (let room of crossroads) {
                if (_.find(collectors, {room: room._id})) {
                    console.log(`Collector exists in ${room._id}`);
                    continue;
                }
                const freePos = await utils.findFreePos(room._id, radius, {
                    x1: 2 + radius,
                    x2: 48 - radius,
                    y1: 2 + radius,
                    y2: 48 - radius
                }).catch(() => false);
                if (!freePos) {
                    console.log(`No free position for score collector in ${room._id}`);
                    continue;
                }

                const structures = [];
                for (let dx = -radius; dx <= radius; dx++) {
                    for (let dy = -radius; dy <= radius; dy++) {
                        if (dx == 0 && dy == 0) {
                            structures.push({
                                room: room._id,
                                x: freePos.x,
                                y: freePos.y,
                                type: 'scoreCollector',
                                store: {},
                                storeCapacityResource: {score: config.common.constants.SCORE_COLLECTOR_MAX_CAPACITY}
                            });
                        } else {
                            const hits = (Math.round(100 * Math.random()) <= critChance) ? critHits : min + Math.round((max - min) * Math.random());
                            structures.push({
                                room: room._id,
                                x: freePos.x + dx,
                                y: freePos.y + dy,
                                type: 'constructedWall',
                                hits,
                                hitsMax: 300000000
                            });
                        }
                    }
                }
                await db['rooms.objects'].insert(structures);
                console.log(`Spawning score collector at ${freePos.x}:${freePos.y}@${room._id}`);
            }

            await env.set('scoreCollectorsGenerated', 1);
        }];
    }
};
