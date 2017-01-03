'use strict';

const cp = require('child_process');

class ImageMagickCmd {
  constructor(options) {
    options = options || {};
    this.src = options.src;
    this.dest = options.dest;
    this.subCmds = options.subCmds || [];
  }

  exec() {
    const cmd = this.compose();
    return new Promise((resolve, reject) => {
      cp.exec(cmd, (err) => {
        if (err) return reject(err);
        resolve({
          cmd: cmd,
          src: this.src,
          dest: this.dest,
        });
      });
    });
  }

  compose() {
    const composedSubCmds = [];

    this.subCmds.forEach((subCmd, index) => {
      if (typeof subCmd.compose === 'function') {
        const composed = index > 0 ? '\\(' + subCmd.compose() + '\\)' : subCmd.compose();

        composedSubCmds.push(composed);
      }
    });

    return `convert ${this.src} ${composedSubCmds.join(' ')} ${this.dest}`;
  }
}

class ImageResizeCmd {
  constructor(options) {
    this.width = options.width;
    this.height = options.height;
    this.ignoreAspectRatio = options.ignoreAspectRatio;
    this.shrinkOnly = options.shrinkOnly;
  }

  compose() {
    const flag = [
      `${this.ignoreAspectRatio ? '\\!' : ''}`,
      `${this.shrinkOnly ? '\\>' : ''}`,
      `${this.enlargeOnly ? '\\<' : ''}`,
    ].join('');

    return `-resize ${this.width}x${this.height} ${flag}`;
  }
}

class ImageProcessor {
  static exec(options) {
    this.src = options.src || '';
    this.dest = options.dest || '';
    this.resizeOpts = options.resizeOpts || {};

    const cmd = new ImageMagickCmd({
      src: options.src,
      dest: options.dest,
      subCmds: [
        new ImageResizeCmd(options.resizeOpts),
      ],
    });

    // console.log(cmd.compose())
    return cmd.exec();
  }
}

module.exports = ImageProcessor;
