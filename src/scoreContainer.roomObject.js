const scoreCycle = 50000;
const bonusStart = 45000;
const bonusEnd = 50000;
const crisisStart = 10000;
const crisisEnd = 15000;
const maxDecay = 5000;

module.exports = function(config) {
    if(config.common) {
        config.common.constants.FIND_SCORE_CONTAINERS = 10011;
        config.common.constants.LOOK_SCORE_CONTAINERS = "scoreContainer";

        config.common.constants.SCORE_CONTAINER_SPAWN_CHANCE = 0.01;
        config.common.constants.SCORE_CONTAINER_SPAWN_INTERVAL = 500; // seconds, obsolete
        config.common.constants.SCORE_CONTAINER_SPAWN_INTERVAL_TICKS = 250; // ticks
    }

    if (config.backend) {
        config.backend.customObjectTypes.scoreContainer = {
            sidepanel: '<div><label>Score:</label><span>{{object.store.score}}</span></div>' +
                '<div><label>Decay in:</label><span>{{object.decayTime - Room.gameTime}}</span></div>'
        };

        config.backend.renderer.resources['score-container'] = `${config.assetsUrl}season1/score-container.svg`;
        config.backend.renderer.metadata.scoreContainer = require('./scoreContainer.render');
    }

    if(config.engine) {
        config.engine.registerCustomObjectPrototype('scoreContainer', 'ScoreContainer', {
            properties: {
                decayTime: object => object.decayTime
            },
            prototypeExtender (prototype, scope, {utils}) {
                const data = id => {
                    if (!scope.runtimeData.roomObjects[id]) {
                        throw new Error("Could not find an object with ID " + id);
                    }
                    return scope.runtimeData.roomObjects[id];
                };

                utils.defineGameObjectProperties(prototype, data, {
                    store: o => new scope.globals.Store(o),
                    ticksToDecay: o => o.decayTime - scope.runtimeData.time
                });

                prototype.toString = function() { return `[scoreContainer #${this.id}]` };
            },
            findConstant: config.common.constants.FIND_SCORE_CONTAINERS,
            lookConstant: config.common.constants.LOOK_SCORE_CONTAINERS
        });

        config.engine.on('processObject', function (object, roomObjects, roomTerrain, gameTime, roomInfo, objectsUpdate, usersUpdate) {
            if (object.type == 'scoreContainer') {
                if (!object.store.score || (object.decayTime <= gameTime)) {
                    objectsUpdate.remove(object._id);
                    delete roomObjects[object._id]
                }
                roomInfo.active = true;
            }
        });
    }

    if(config.cronjobs) {
        config.cronjobs.genScoreContainers = [60, async ({utils}) => {
            const { db, env } = config.common.storage;
            const gameTime = parseInt(await env.get(env.keys.GAMETIME));
            if(gameTime <= 1) {
                return;
            }

            const lastScoreContainersSpawnTick = parseInt(await env.get('lastScoreContainersSpawnTick'));
            if((gameTime - lastScoreContainersSpawnTick) < config.common.constants.SCORE_CONTAINER_SPAWN_INTERVAL_TICKS) {
                return;
            }

            const cycleTime = gameTime % scoreCycle;
            if((cycleTime > crisisStart) && (cycleTime < crisisEnd)) {
                return;
            }

            const multiplier = (cycleTime > bonusStart) && (cycleTime < bonusEnd) ? 2 : 1;

            const rooms = await db.rooms.find({status: {$ne: 'out of borders'}});
            for(let room of rooms) {
                if(Math.random() < config.common.constants.SCORE_CONTAINER_SPAWN_CHANCE) {
                    const freePos = await utils.findFreePos(room._id, 0);
                    if(!freePos) {
                        console.log(`No free position for score source in ${room._id}`);
                        return;
                    }
                    const densityRoll = 100*Math.random();
                    let score = 500 + Math.round(2000*Math.random());
                    let decay = 500 + Math.round(2000*Math.random());
                    if(densityRoll <= 47) {
                        score = 3500 + Math.round(3000*Math.random());
                        decay = 3500 + Math.round(3000*Math.random());
                    }
                    if(densityRoll <= 18) {
                        score = 8500 + Math.round(3000*Math.random());
                        decay = 8500 + Math.round(3000*Math.random());
                    }
                    score = score * multiplier;

                    const decayTime = gameTime + Math.min(maxDecay, decay);
                    await db['rooms.objects'].insert({
                        type: 'scoreContainer',
                        room: room._id,
                        x: freePos.x,
                        y: freePos.y,
                        store: {score},
                        decayTime
                    });
                    await utils.activateRoom(room._id);
                    console.log(`Spawned score container in ${freePos.x}:${freePos.y}@${room._id} (score: ${score}, roll ${densityRoll})`);
                }
            }
            await env.set('lastScoreContainersSpawnTick', gameTime);
        }];
    }
};
