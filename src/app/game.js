import { loadBackgrounds, loadSprites, loadStage } from './libs/loaders';
import Timer from './libs/Timer';
import Layer from './libs/Layer';
import Compositor from './libs/Compositor';
import Qbert from './entities/Qbert'
import Vec2 from './libs/Vec2';
import config from './config';
import { degToRad } from './libs/math';

async function main(canvas) {
  const context = canvas.getContext('2d');

  // Maps
  const tilesMap = await loadSprites('tiles.json');
  const charactersMap = await loadSprites('characters.json');
  const bgMap = await loadBackgrounds('backgrounds.json', tilesMap);

  // Stage
  const stage1 = await loadStage(1, tilesMap);

  // Entities
  const qbert = new Qbert(charactersMap, new Vec2(15, 1));

  // Layers
  const entitiesLayer = new Layer(new Vec2(0.5, 0.6), config.screen);
  entitiesLayer.addSprite(qbert);

  // Compositor
  const compositor = new Compositor();
  //compositor.addLayer(bgMap.getAnimation('level-cleared'));
  compositor.addLayer(bgMap.get('bg-game-1'));
  compositor.addLayer(stage1.level1);
  compositor.addLayer(entitiesLayer);

  // Time based main loop
  const timer = new Timer();

  // Test code... it will be deleted
  setTimeout(() => qbert.jump.leftDown(), 1000);
  setTimeout(() => qbert.jump.leftDown(), 2000);
  setTimeout(() => qbert.jump.leftDown(), 3000);
  setTimeout(() => qbert.jump.leftDown(), 4000);

  // Main loop
  timer.update = time => {
    compositor.update(time);
    compositor.render(context, time);
  };
  timer.start();
}

const canvas = document.getElementById('game');
main(canvas);
