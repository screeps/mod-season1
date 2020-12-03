module.exports = function(config) {
  if(config.backend) {
    function getDecorations(location) {
      const wall = {
        "active": {
          "strokeWidth": 20,
          "foregroundColor": "#3059E8",
          "foregroundBrightness": 1,
          "foregroundAlpha": 1,
          "backgroundColor": "#000C35",
          "backgroundBrightness": 1,
          "strokeColor": "#2B3454",
          "strokeBrightness": 1,
          "strokeLighting": 0,
          "world": true,
          "room": location.room
        },
        "decoration": {
          "graphics": [],
          "type": "wallLandscape",
          "name": "Seasonal wall",
          "foregroundUrl": `${config.assetsUrl}season1/walls.png`
        }
      };
      const floor = {
        "active": {
          "swampStrokeWidth": 40,
          "floorBackgroundColor": "#9C8A4A",
          "floorBackgroundBrightness": 1,
          "floorForegroundColor": "#CBB051",
          "floorForegroundBrightness": 1,
          "floorForegroundAlpha": 0.5,
          "swampColor": "#0038FF",
          "swampStrokeColor": "#0038FF",
          "roadsColor": "#F2D15D",
          "roadsBrightness": 1,
          "world": true,
          "room": location.room
        },
        "decoration": {
          "graphics": [],
          "type": "floorLandscape",
          "name": "Seasonal floor",
          "floorForegroundUrl": `${config.assetsUrl}season1/floor.png`,
          "tileScale": 1
        }
      };
      if(location.shard) {
        wall.active.shard = location.shard;
        floor.active.shard = location.shard;
      }

      return [floor, wall];
    };

    config.backend.on('expressPostConfig', function(app) {
      config.backend.router.get('/game/room-decorations', (request, response) => {
        const decorations = getDecorations(request.query);
        response.json({ ok: 1, decorations });
      });
    });
  }
}
