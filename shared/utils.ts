import { LOCAL_NODE_API_URL } from './constants';
import { PublicService, SocketAddress } from './types';

// eslint-disable-next-line import/prefer-default-export
export const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });

// promisifed debounce function with multiple consumers
// can not be cancelled
export const debounce = <T extends unknown>(delay: number, cb: (...args: any[]) => T | Promise<T>) => {
  type PromiseHandler = (T) => any;

  let t: ReturnType<typeof setTimeout> | null = null;
  let thenResolvers: PromiseHandler[] = [];
  let thenRejecters: PromiseHandler[] = [];
  let catchResolvers: PromiseHandler[] = [];

  const resolve = (r: any) => thenResolvers.forEach((fn: PromiseHandler) => fn(r));
  const reject = (r: any) => {
    thenRejecters.forEach((fn: PromiseHandler) => fn(r));
    catchResolvers.forEach((fn: PromiseHandler) => fn(r));
  };
  const clearHandlers = () => {
    thenResolvers = [];
    thenRejecters = [];
    catchResolvers = [];
  };

  return (...args: any[]) => {
    t && clearTimeout(t);
    t = setTimeout(() => {
      try {
        const r = cb(...args);
        if (r && r instanceof Promise) {
          // eslint-disable-next-line promise/catch-or-return
          r.then(resolve)
            .catch(reject)
            .then((x) => {
              clearHandlers();
              return x;
            });
        } else {
          resolve(r);
          clearHandlers();
        }
      } catch (err) {
        reject(err);
        clearHandlers();
      }
    }, delay);
    return {
      then: (fn: PromiseHandler) =>
        new Promise((resolve, reject) => {
          thenResolvers.push((result: T) => resolve(fn(result)));
          thenRejecters.push((err: Error) => reject(err));
        }),
      catch: (fn: PromiseHandler) =>
        new Promise((resolve) => {
          catchResolvers.push((result: T) => resolve(fn(result)));
        }),
    } as Promise<T>;
  };
};

// Func utils
export const shallowEq = <T extends Record<string, any> | Array<any>>(a: T, b: T) => {
  if (a === b) return true;

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.reduce((acc, next, idx) => acc && next === b[idx], true);
  }
  if (typeof a !== typeof b || Array.isArray(a) || Array.isArray(b) || !a || !b) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  return aKeys.reduce((acc, key) => acc && a[key] === b[key], true);
};

// GRPC APIs
export const toSocketAddress = (url?: string): SocketAddress => {
  if (!url) return LOCAL_NODE_API_URL;

  const u = new URL(url.startsWith('http') ? url : `http://${url}`);
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error(`Unsupported protocol in GRPC remote API URL: ${url}`);
  }
  return {
    host: u.hostname,
    port: u.port || u.protocol === 'https:' ? '443' : '9090',
    protocol: u.protocol,
  };
};

export const stringifySocketAddress = (sa: SocketAddress): string => (sa ? `${sa.protocol}//${sa.host}${sa.port && `:${sa.port}`}` : '');

export const isLocalNodeApi = (sa: SocketAddress) => shallowEq(sa, LOCAL_NODE_API_URL);

export const isRemoteNodeApi = (sa: SocketAddress) => !isLocalNodeApi(sa);

export const toPublicService = (netName: string, url: string): PublicService => ({
  name: netName,
  ...toSocketAddress(url),
});
