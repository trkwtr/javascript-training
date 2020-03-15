
Number.isNaN = Number.isNaN || function(value) {
  // return typeof value === 'number' && isNaN(value);
  return typeof value === "number" && value !== value;
}

const isNumber = function(value: number) {
  return ((typeof value === 'number') && (isFinite(value)));
};


module Util {

  export function defaultString(val: string, def: string = ''): string {
    if (val == null) { return def; }
    return String(val);
  }

  export function defaultInt(val: number, def: number = 0) {
    if (val == null) { return def; }
    if (Number.isNaN(parseInt('' + val))) { return def; }
    return val;
  }

  export function defaultFloat(val: any, def: number = 0.0) {
    if (val == null) { return def; }
    const i = parseFloat(val);
    if (Number.isNaN(i)) { return def; }
    return i;
  }

  export function obj(obj: { [key: string]: any }, key: string, def: any): any {
    if (obj === void 0) { return def; }


    if (obj != null && obj.hasOwnProperty(key)) {
      return obj[key];
    }
    return def;
  }

  export function objString(obj: { [key: string]: any }, key: string, def: string = ''): string {
    if (obj != null && obj.hasOwnProperty(key)) {
      return String(obj[key]);
    }
    return def;
  }

  export function objInt(obj: { [key: string]: any }, key: string, def: number = 0): number {
    if (obj != null && obj.hasOwnProperty(key)) {
      if (obj[key] == null && isNaN(obj[key])) {
        return def;
      }
      return parseInt(obj[key]);
    }
    return def;
  }

  export function objFloat(obj: { [key: string]: any }, key: string, def: number = 0): number {
    if (obj != null && obj.hasOwnProperty(key)) {
      if (isNaN(obj[key])) {
        return def;
      }
      return parseFloat(obj[key]);
    }
    return def;
  }

  export function isNumber(val: any) {
    return ((typeof val === 'number') && (isFinite(val)));
  }

  export function listUniq(list: any[]): any[] {
    return list.filter((val, i, arr) => arr.indexOf(val) === i);
  }

  export function getParam(): object {
    const search: string = location.search;

    const param: { [key: string]: any } = {};

    if (search.indexOf('?') !== -1) {
      search.split('?')[1].split('&').forEach(function(value: string) {
        const item = value.split('=');
        if (item.length === 2) {
          const key: string = item[0];
          const val: string = item[1];

          if (Util.isNumber(parseInt(val))) {
            param[key] = Number(val);
          } else {
            param[key] = val;
          }
        }
      });
    }

    return param;
  }

  export function extend(obj: object, ...obj2: object[]) {
    const result: { [key: string]: any } = obj || {};

    for (let i = 0; i < arguments.length; i++) {
      if (!arguments[i]) {
        continue;
      }

      const value = arguments[i];
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          result[key] = value[key];
        }
      }
    }

    return result;
  }

  export function promiseJson(url: string, cache: boolean = true) {
    return $.ajax({
      dataType: 'json',
      url: url,
      cache: cache,
    });
  }

  export function promiseWhen(promiseList: JQuery.jqXHR<any>[]) {
    return $.when.apply(null, promiseList);
  }

  export function promiseResolve(promise: JQuery.jqXHR<any>) {
    const dfd = $.Deferred();

    promise.done(function() {
      // dfd.resolve(arguments);
    }).fail(function() {
      // dfd.resolve(arguments);
    }).always(function() {
      dfd.resolve(arguments);
    });

    return dfd.promise();
  }
}