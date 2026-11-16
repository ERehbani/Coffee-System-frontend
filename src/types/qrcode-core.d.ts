// Core of the `qrcode` package: builds the module matrix without the canvas/PNG/fs renderers.
declare module 'qrcode/lib/core/qrcode' {
  export { create } from 'qrcode';
}
