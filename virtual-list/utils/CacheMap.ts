// deno-lint-ignore-file no-explicit-any

// Firefox has low performance of map.
class CacheMap {
  maps: Record<string, number>;

  constructor() {
    this.maps = Object.create(null);
  }

  set(key: any, value: number) {
    this.maps[key] = value;
  }

  get(key: any) {
    return this.maps[key];
  }
}

export default CacheMap;
