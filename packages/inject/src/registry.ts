import { InjectionToken } from "./types";

export class Registry<T extends unknown & { tag?: string }> {
  protected _registryMap = new Map<InjectionToken<any>, T[]>();

  public entries(): IterableIterator<[InjectionToken<any>, T[]]> {
    return this._registryMap.entries();
  }

  public getAll(key: InjectionToken<any>, tag?: string): T[] {
    this.ensure(key);
    if (tag) {
      return this._registryMap.get(key)!.filter(item => item.tag === tag)
    }
    return this._registryMap.get(key)!;
  }

  public get(key: InjectionToken<any>, tag?: string): T | null {
    this.ensure(key);
    const value = this._registryMap.get(key)!
    if (tag) {
      return value.find(item => item.tag === tag) || null
    }
    return value[value.length - 1] || null;
  }

  public set(key: InjectionToken<any>, value: T): void {
    this.ensure(key);
    this._registryMap.get(key)!.push(value);
  }

  public setAll(key: InjectionToken<any>, value: T[]): void {
    this._registryMap.set(key, value);
  }

  public has(key: InjectionToken<any>): boolean {
    this.ensure(key);
    return this._registryMap.get(key)!.length > 0;
  }

  public clear(): void {
    this._registryMap.clear();
  }

  private ensure(key: InjectionToken<any>): void {
    if (!this._registryMap.has(key)) {
      this._registryMap.set(key, []);
    }
  }
}