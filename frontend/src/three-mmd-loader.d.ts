declare module 'three/examples/jsm/loaders/MMDLoader.js' {
  import * as THREE from 'three';

  export class MMDLoader extends THREE.Loader {
    load(
      url: string,
      onLoad: (mesh: THREE.SkinnedMesh) => void,
      onProgress?: (event: ProgressEvent<EventTarget>) => void,
      onError?: (event: unknown) => void,
    ): void;
  }
}
