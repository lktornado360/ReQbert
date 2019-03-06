import config from '../config.js';
import { castArray } from './utils';
import { createAnimation } from './animation';
import Vec2 from './Vec2';
import Range from './Range';

export default class BackgroundMap {
  constructor(backgroundsSpec, spriteMap) {
    this.size = new Vec2(config.screen.width, config.screen.height);
    this.backgrounds = new Map();
    this.animations = new Map();

    backgroundsSpec.backgrounds.forEach(this._createBackground(spriteMap));
    backgroundsSpec.animations.forEach(this._createAnimation.bind(this));
  }

  _createAnimation(animSpec) {
    const backgrounds = this.backgrounds;
    animSpec.backgrounds = animSpec.frames.map(bgName =>
      backgrounds.get(bgName)
    );
    this.animations.set(animSpec.name, animSpec);
  }

  _createBackground(spriteMap) {
    return bgSpec => {
      const buffer = document.createElement('canvas');

      // Buffer size
      buffer.width = this.size.x;
      buffer.height = this.size.y;

      // Fill buffer with defined color
      const context = buffer.getContext('2d');
      this._fillBuffer(context, bgSpec.color);

      // Draw spriteMap into the buffer
      bgSpec.fill.forEach(this._drawToBuffer(context, spriteMap));

      // Index background buffer
      this.backgrounds.set(bgSpec.name, buffer);
    };
  }

  _fillBuffer(context, color) {
    if (color) {
      context.fillStyle = color;
      context.fillRect(0, 0, this.size.x, this.size.y);
    } else {
      context.fillStyle = 'rgba(0, 0, 0, 1)';
    }
  }

  _drawToBuffer(context, spriteMap) {
    function normalizeRange(fn) {
      return range => {
        range = Array.isArray(range) ? range : [range, range];
        fn(new Range(range[0], range[1]));
      };
    }

    function drawTile(rangeX, rangeY, { step, names, nameIndex, index }) {
      rangeX.forEach(x => {
        rangeY.forEach(y => {
          let spriteName = names[nameIndex++ % names.length];
          spriteMap.draw(spriteName, context, new Vec2(x, y), index || 0);
        }, step.y);
      }, step.x);
    }

    return fillSpec => {
      const fillCxt = {
        names: castArray(fillSpec.spriteName),
        nameIndex: 0,
        index: fillSpec.index
      };

      // Process ranges
      fillSpec.ranges.forEach(range => {
        fillCxt.step = new Vec2(range.stepX || 1, range.stepY || 1);
        // Process X range
        range.x.forEach(
          normalizeRange(rangeX => {
            // Process Y range
            range.y.forEach(
              normalizeRange(rangeY => {
                drawTile(rangeX, rangeY, fillCxt);
              })
            );
          })
        );
      });
    };
  }

  get(bgName) {
    const bg = this.backgrounds.get(bgName);
    return { render: (context) => {
      this._draw(context, bg);
    }};
  }

  getAnimation(animationName) {
    const animSpec = this.animations.get(animationName);
    const bgAnim = createAnimation(animSpec.backgrounds, animSpec.frameTime);
    let elapsedTime = 0;
    return { render: (context, time) => {
      this._draw(context, bgAnim(elapsedTime));
      elapsedTime += time;
    }};
  }

  _draw(context, frame) {
    context.drawImage(frame, 0, 0);
  }
}
