module.exports = function (config) {
    config.assetsUrl = 'https://s3.amazonaws.com/static.screeps.com/';

    if (config.backend && config.backend.features) {
        config.backend.features.push({ name: 'season1', version: 1 })
    }

    if(config.common) {
        config.common.constants.RESOURCE_SCORE = 'score';
        config.common.constants.RESOURCES_ALL.push(config.common.constants.RESOURCE_SCORE);
    }

    require('./scoreContainer.roomObject')(config);
    require('./scoreCollector.roomObject')(config);
    require('./decorations')(config);
    require('./scoreboard')(config);
    require('./terminal-restriction')(config);
    require('./stronghold-rewards')(config);
    try{
        require('./official-specific')(config);
    } catch {}
};
