const _ = require('lodash'),
    q = require('q');

module.exports = function(config) {
    if(config.backend && config.backend.router) {
        config.backend.router.get('/scoreboard/list', async (request, response) => {
            if(!(parseInt(request.query.limit) <= 20)) {
                return q.reject('invalid params');
            }
            const length = await await config.common.storage.db['users'].count({rank: {$exists: true}});
            const start = parseInt(request.query.offset||0), end = parseInt(request.query.offset||0) + parseInt(request.query.limit);
            const users = await config.common.storage.db['users'].find({rank: {$exists: true, $gt: start, $lte: end}}, {username: 1, badge: 1, score: 1, rank: 1});

            response.json({ok: 1, users: _.sortBy(users, 'rank'), meta: {length}});
        });
    }

    if(config.cronjobs) {
        config.cronjobs.updateRanks = [60, async function() {
            const users = await config.common.storage.db['users'].find({cpu: {$gt: 0}}, {username: 1, score: 1, rank: 1});
            const sortedUsers = _.sortByOrder(users, [u => (u.score||0), 'registeredDate'], ['desc', 'asc']);
            const promises = [];
            for(let i in sortedUsers) {
                const rank = parseInt(i)+1;
                if(sortedUsers[i].rank != rank) {
                    promises.push(config.common.storage.db['users'].update({_id: sortedUsers[i]._id}, {$set: {rank}}));
                }
            }
            await q.all(promises);
        }];
    }
};
