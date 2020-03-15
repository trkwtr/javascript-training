'use strict';

'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var Map = /** @class */ (function() {
  // ============================================================
  /**
   * コンストラクタ
   */
  function Map() {
    // ============================================================
    /** 緯度 */
    this.lat = 0;
    /** 経度 */
    this.lng = 0;
    /** ズームレベル */
    this.zoom = 10;
    /** メッシュコードリスト */
    this.meshCodeList = [];
    //
  }
  Map.prototype.initMap = function(lat, lng, zoom) {
    var _this = this;
    this.lat = lat;
    this.lng = lng;
    this.zoom = zoom;
    this.map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.XYZ({
            attributions: ["<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"],
            url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
            projection: 'EPSG:3857'
          })
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([this.lng, this.lat]),
        zoom: this.zoom,
        minZoom: 11,
        maxZoom: 15
      }),
      controls: ol.control.defaults({
        attribution: true,
        attributionOptions: {
          collapsible: false,
          collapsed: false
        }
      })
    });
    // スケール
    this.map.addControl(new ol.control.ScaleLine());
    // メッシュレイヤーを登録
    this.meshLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: Map.meshStyleFunction
    });
    this.map.addLayer(this.meshLayer);
    this.map.once('moveend', function(evt) {
      //   this.moveEndEvent(evt);
    });
    this.map.on('movestart', function(evt) {
      _this.moveStartEvent(evt);
    });
    this.map.on('moveend', function(evt) {
      _this.moveEndEvent(evt);
    });
    this.map.on('pointermove', function(evt) {
      _this.pointerMoveEvent(evt);
    });
  };
  Map.prototype.moveStartEvent = function(evt) {
    //
  };
  Map.prototype.moveEndEvent = function(evt) {
    var map = evt.map;
    // const frameState: ol.olx.FrameState = evt.frameState;
    var zoom = parseInt('' + map.getView().getZoom());
    if (this.zoom !== zoom) {
      this.zoom = zoom;
      this.mapZoomChange(evt);
    }
    // console.log('zoom', map.getView().getZoom());
    // 範囲
    var extent = map.getView().calculateExtent(map.getSize());
    var northEast = ol.extent.getTopRight(extent);
    var southWest = ol.extent.getBottomLeft(extent);
    var center = ol.extent.getCenter(MapUtil.toExtent(extent));
    var meshCode = MeshUtil.latLngToMeshCode(center);
    var tempCodeList = _.concat(this.meshCodeList);
    this.meshCodeList = MeshUtil.mapMeshCodeList(map);
    var addMeshCodeList = _.difference(this.meshCodeList, tempCodeList);
    var delMeshCodeList = _.difference(tempCodeList, this.meshCodeList);
    this.addMesh(addMeshCodeList);
    this.removeMesh(delMeshCodeList);
  };
  Map.prototype.mapZoomChange = function(evt) {
    var map = evt.map;
    console.log('mapZoomChange', parseInt('' + map.getView().getZoom()));
    //
  };
  Map.prototype.pointerMoveEvent = function(evt) {
    // const map: ol.Map = evt.map;
    var coordinate = evt.coordinate;
    var latLng = ol.proj.toLonLat(coordinate);
    // $('#latLng').val(MapUtil.toStringXY(latLng, 2));
    var meshCode = MeshUtil.latLngToMeshCode(latLng);
    // $('#meshCode').val(meshCode);
    var latLng2 = MeshUtil.meshCodeToLatLng(meshCode);
    // $('#latLng2').val(MapUtil.toStringXY(latLng2, 2));
  };
  Map.prototype.addMesh = function(meshCodeList) {
    var _this = this;
    if (meshCodeList != null && meshCodeList.length > 0) {
      var source_1 = this.meshLayer.getSource();
      meshCodeList.forEach(function(meshCode) {
        try {
          var feature = _this.createMeshFeature(meshCode);
          if (feature != null) {
            source_1.addFeature(feature);
          }
        } catch (error) {
          console.log(error);
        }
      });
    }
  };
  Map.prototype.removeMesh = function(meshCodeList) {
    if (meshCodeList != null && meshCodeList.length > 0) {
      var source_2 = this.meshLayer.getSource();
      meshCodeList.forEach(function(meshCode) {
        var feature = source_2.getFeatureById(meshCode);
        if (feature != null) {
          source_2.removeFeature(feature);
        }
      });
    }
  };
  Map.prototype.createMeshFeature = function(meshCode) {
    // console.log('createMeshFeature()', meshCode);
    // const polygon: ol.geom.Polygon = this.createMeshPolygon(meshCode);
    // console.log(polygon);
    var extent = MapUtil.fromExtent(MapUtil.meshCodeToExtent(meshCode));
    var northEast = ol.extent.getTopRight(extent);
    var southWest = ol.extent.getBottomLeft(extent);
    var north = MapUtil.lat(northEast);
    var east = MapUtil.lng(northEast);
    var south = MapUtil.lat(southWest);
    var west = MapUtil.lng(southWest);
    var geometry = [[MapUtil.latLng(north, west), MapUtil.latLng(north, east), MapUtil.latLng(south, east), MapUtil.latLng(south, west), MapUtil.latLng(north, west)]];
    var polygon = new ol.geom.Polygon(geometry);
    var feature = new ol.Feature(polygon);
    // feature.setGeometry(geometry);
    feature.setId(meshCode);
    return feature;
  };
  /**
   * メッシュスタイル関数
   * @param feature {ol.Feature}
   */
  Map.meshStyleFunction = function(feature) {
    var r = parseInt('' + 255 * Math.random());
    var g = parseInt('' + 255 * Math.random());
    var b = parseInt('' + 255 * Math.random());
    // console.log(r, g, b);
    var zIndex = Math.random() * 10;
    var red = ('00' + r.toString(16)).slice(-2);
    var green = ('00' + g.toString(16)).slice(-2);
    var blue = ('00' + b.toString(16)).slice(-2);
    var color = '#' + red + green + blue;
    var rgba = 'rgba(' + r + ',' + g + ',' + b + ',.2)';
    // スタイル
    var style = new ol.style.Style({
      fill: new ol.style.Fill({
        color: rgba
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(0,0,0,1)',
        width: 2
      }),
      text: new ol.style.Text({
        text: '' + feature.getId()
      }),
      zIndex: zIndex
    });
    return style;
  };
  // ============================================================
  /** 球面メルカトル図法 */
  Map.projectionMercator = 'EPSG:3857';
  /** WGS84 */
  Map.projectionWGS84 = 'EPSG:4326';
  return Map;
})();
exports.Map = Map;

('use strict');
var MapUtil;
(function(MapUtil) {
  /** 球面メルカトル図法 */
  MapUtil.EPSG3857 = 'EPSG:3857';
  /** 地理座標系 */
  MapUtil.EPSG4326 = 'EPSG:4326';
  function mapExtent(map) {
    return map.getView().calculateExtent(map.getSize());
  }
  MapUtil.mapExtent = mapExtent;
  function lat(coordinate) {
    return coordinate[1];
  }
  MapUtil.lat = lat;
  function lng(coordinate) {
    return coordinate[0];
  }
  MapUtil.lng = lng;
  function latLng(lat, lng) {
    return [lng, lat];
  }
  MapUtil.latLng = latLng;
  /**
   * 地理座標系 ← 球面メルカトル図法
   * @param coordinate
   */
  function toLonLat(coordinate) {
    // return ol.proj.toLonLat(coordinate);
    return ol.proj.transform(coordinate, MapUtil.EPSG3857, MapUtil.EPSG4326);
  }
  MapUtil.toLonLat = toLonLat;
  /**
   * 球面メルカトル図法 ← 地理座標系
   * @param coordinate
   */
  function fromLonLat(coordinate) {
    // return ol.proj.fromLonLat(coordinate);
    return ol.proj.transform(coordinate, MapUtil.EPSG4326, MapUtil.EPSG3857);
  }
  MapUtil.fromLonLat = fromLonLat;
  /**
   * 地理座標系 ← 球面メルカトル図法
   * @param extent
   */
  function toExtent(extent) {
    return ol.proj.transformExtent(extent, MapUtil.EPSG3857, MapUtil.EPSG4326);
  }
  MapUtil.toExtent = toExtent;
  /**
   * 球面メルカトル図法 ← 地理座標系
   * @param extent
   */
  function fromExtent(extent) {
    return ol.proj.transformExtent(extent, MapUtil.EPSG4326, MapUtil.EPSG3857);
  }
  MapUtil.fromExtent = fromExtent;
  /**
   * 座標をフォーマット
   * @param coordinate {ol.Coordinate} 座標
   * @param template {string} テンプレート 'Coordinate is ({x}|{y}).'
   * @param digits {number} 桁数
   */
  function format(coordinate, template, digits) {
    return ol.coordinate.format(coordinate, template, 4);
  }
  MapUtil.format = format;
  /**
   * 緯度経度の桁数を調整
   * @param coordinate {ol.Coordinate} 座標
   * @param digits {number} 桁数
   */
  function toStringXY(coordinate, digits) {
    return ol.coordinate.toStringXY(coordinate, digits);
  }
  MapUtil.toStringXY = toStringXY;
})(MapUtil || (MapUtil = {}));

('use strict');
var Mesh = /** @class */ (function() {
  /**
   * コンストラクタ
   * @param meshCode {string} メッシュコード
   * @param extent {ol.Extent} 範囲
   */
  function Mesh(meshCode, extent) {
    this.meshCode = meshCode;
    this.extent = extent;
    this.lat1 = parseInt(meshCode.substr(0, 2));
    this.lng1 = parseInt(meshCode.substr(2, 2));
    this.lat2 = parseInt(meshCode.substr(4, 1));
    this.lng2 = parseInt(meshCode.substr(5, 1));
    this.lat3 = parseInt(meshCode.substr(6, 1));
    this.lng3 = parseInt(meshCode.substr(7, 1));
  }
  Mesh.prototype.before = function(mesh) {
    if (this.lat1 <= mesh.lat1 && this.lng1 <= mesh.lng1) {
      if (this.lat1 < mesh.lat1 || this.lng1 < mesh.lng1) {
        return true;
      }
      // 1次メッシュが同じ
      if (this.lat2 <= mesh.lat2 && this.lng2 <= mesh.lng2) {
        if (this.lat2 < mesh.lat2 || this.lng2 < mesh.lng2) {
          return true;
        }
        // 2次メッシュが同じ
        if (this.lat3 <= mesh.lat3 && this.lng3 <= mesh.lng3) {
          if (this.lat3 < mesh.lat3 || this.lng3 < mesh.lng3) {
            return true;
          }
          // 3次メッシュが同じ
        }
      }
    }
    return false;
  };
  Mesh.prototype.after = function(mesh) {
    if (this.lat1 >= mesh.lat1 && this.lng1 >= mesh.lng1) {
      if (this.lat1 > mesh.lat1 || this.lng1 > mesh.lng1) {
        return true;
      }
      // 1次メッシュが同じ
      if (this.lat2 >= mesh.lat2 && this.lng2 >= mesh.lng2) {
        if (this.lat2 > mesh.lat2 || this.lng2 > mesh.lng2) {
          return true;
        }
        // 2次メッシュが同じ
        if (this.lat3 >= mesh.lat3 && this.lng3 >= mesh.lng3) {
          if (this.lat3 > mesh.lat3 || this.lng3 > mesh.lng3) {
            return true;
          }
          // 3次メッシュが同じ
        }
      }
    }
    return false;
  };
  return Mesh;
})();

('use strict');
var MeshUtil;
(function(MeshUtil) {
  /**
   * 地図のメッシュリストを取得
   * @param map {ol.Map} 地図
   */
  function mapMeshCodeList(map) {
    if (map === void 0) {
      return;
    }
    // 地図範囲
    var mapExtent = MapUtil.toExtent(MapUtil.mapExtent(map));
    // 北東緯度経度
    var northEastLatLng = ol.extent.getTopRight(mapExtent);
    // 南西緯度経度
    var southWestLatLng = ol.extent.getBottomLeft(mapExtent);
    // 北東メッシュコード
    var northEastMeshCode = MeshUtil.latLngToMeshCode(northEastLatLng);
    // 南西メッシュコード
    var southWestMeshCode = MeshUtil.latLngToMeshCode(southWestLatLng);
    var north = MapUtil.lat(northEastLatLng);
    var east = MapUtil.lng(northEastLatLng);
    var south = MapUtil.lat(southWestLatLng);
    var west = MapUtil.lng(southWestLatLng);
    var northS = north * 3600;
    var eastS = east * 3600;
    var southS = south * 3600;
    var westS = west * 3600;
    var list2 = MeshUtil.extentMeshCodeList(northEastMeshCode, southWestMeshCode);
    var list = [];
    // for (let i = southS; i <= northS; i += 30) {
    //   for (let j = westS; j <= eastS; j += 45) {
    //     const lat: number = (i / 3600);
    //     const lng: number = (j / 3600);
    //     const meshCode: string = app.meshUtil.latLngToMeshCode([lng, lat]);
    //     // list.push(MeshUtil.instanceMesh(meshCode));
    //     list.push(meshCode);
    //   }
    // }
    console.log('mapMeshCodeList', list.length, list2.length, _.uniq(list2).length);
    return list2;
  }
  MeshUtil.mapMeshCodeList = mapMeshCodeList;
  /**
   * Meshを取得
   * @param meshCode
   */
  function createMesh(meshCode) {
    var extent = MeshUtil.meshCodeToExtent(meshCode);
    if (extent == null) {
      return;
    }
    return new Mesh(meshCode, extent);
  }
  MeshUtil.createMesh = createMesh;
  /**
   * メッシュコード範囲を取得
   * @param meshCode {string} メッシュコード
   */
  function meshCodeToExtent(meshCode) {
    var latLng = MeshUtil.meshCodeToLatLng(meshCode);
    if (latLng == null) {
      return;
    }
    var south = latLng[1];
    var west = latLng[0];
    var north = (south * 3600 + 30) / 3600;
    var east = (west * 3600 + 45) / 3600;
    return [west, south, east, north];
  }
  MeshUtil.meshCodeToExtent = meshCodeToExtent;
  /**
   * メッシュコードを座標に変換
   * @param meshCode {string} メッシュコード
   */
  function meshCodeToLatLng(meshCode) {
    if (meshCode === void 0) {
      return;
    }
    if (meshCode.length !== 8) {
      return;
    }
    var lat1 = (parseInt(meshCode.substr(0, 2)) / 1.5) * 3600;
    var lng1 = (parseInt(meshCode.substr(2, 2)) + 100) * 3600;
    var lat2 = parseInt(meshCode.substr(4, 1)) * 5 * 60;
    var lng2 = parseInt(meshCode.substr(5, 1)) * 7.5 * 60;
    var lat3 = parseInt(meshCode.substr(6, 1)) * 30;
    var lng3 = parseInt(meshCode.substr(7, 1)) * 45;
    return [(lng1 + lng2 + lng3) / 3600, (lat1 + lat2 + lat3) / 3600];
  }
  MeshUtil.meshCodeToLatLng = meshCodeToLatLng;
  /**
   * 座標をメッシュコードに変換
   * @param coordinate {ol.Coordinate} 座標
   */
  function latLngToMeshCode(coordinate) {
    if (coordinate === void 0) {
      return;
    }
    var lat = coordinate[1];
    var lng = coordinate[0];
    // if (lat < 20 || 46 < lat) {
    //   return;
    // }
    // if (lng < 122 || 154 < lng) {
    //   return;
    // }
    var mc1lat = Math.floor((lat * 60) / 40);
    var mc1lat_mod = (lat * 60) % 40;
    var mc2lat = Math.floor(mc1lat_mod / 5);
    var mc2lat_mod = mc1lat_mod % 5;
    var mc3lat = Math.floor((mc2lat_mod * 60) / 30);
    // const mc3lat_mod: number = (mc2lat_amari * 60) % 30;
    var mc1lng = Math.floor(lng - 100);
    var mc1lng_mod = lng - (100 + mc1lng);
    var mc2lng = Math.floor((mc1lng_mod * 60) / 7.5);
    var mc2lng_mod = (mc1lng_mod * 60) % 7.5;
    var mc3lng = Math.floor((mc2lng_mod * 60) / 45);
    // const mc3lng_mod: number = (mc2lng_amari * 60) % 45;
    // const meshCode: string = '' + mc1lat + mc1lng + mc2lat + mc2lng + mc3lat + mc3lng;
    return '' + mc1lat + mc1lng + mc2lat + mc2lng + mc3lat + mc3lng;
  }
  MeshUtil.latLngToMeshCode = latLngToMeshCode;
  /**
   *
   * @param northEastMeshCode
   * @param southWestMeshCode
   */
  function extentMeshCodeList(northEastMeshCode, southWestMeshCode) {
    if (northEastMeshCode === void 0) {
      return;
    }
    if (southWestMeshCode === void 0) {
      return;
    }
    var list = [];
    var northEast = MeshUtil.createMesh(northEastMeshCode);
    var southWest = MeshUtil.createMesh(southWestMeshCode);
    // console.log(ne, sw);
    // 緯度ループ
    var mesh = MeshUtil.createMesh(southWest.meshCode);
    while (mesh.before(northEast) || MeshUtil.equal(mesh, northEast)) {
      // 経度ループ
      var mesh2 = MeshUtil.createMesh(mesh.meshCode);
      while (mesh2.before(northEast) || MeshUtil.equal(mesh2, northEast)) {
        list.push(mesh2.meshCode);
        mesh2 = MeshUtil.addMeshCodeLng(mesh2);
      }
      mesh = MeshUtil.addMeshCodeLat(mesh);
    }
    return list;
  }
  MeshUtil.extentMeshCodeList = extentMeshCodeList;
  function equal(mesh1, mesh2) {
    return mesh1.meshCode === mesh2.meshCode;
  }
  MeshUtil.equal = equal;
  function addMeshCodeLat(mesh) {
    return MeshUtil.addMeshCode(mesh, true, false);
  }
  MeshUtil.addMeshCodeLat = addMeshCodeLat;
  function addMeshCodeLng(mesh) {
    return MeshUtil.addMeshCode(mesh, false, true);
  }
  MeshUtil.addMeshCodeLng = addMeshCodeLng;
  function addMeshCode(mesh, addLat, addLng) {
    var lat1 = mesh.lat1;
    var lat2 = mesh.lat2;
    var lat3 = mesh.lat3;
    var lng1 = mesh.lng1;
    var lng2 = mesh.lng2;
    var lng3 = mesh.lng3;
    if (addLat) {
      lat3++;
      if (lat3 > 9) {
        lat2++;
        lat3 = 0;
      }
      if (lat2 > 7) {
        lat1++;
        lat2 = 0;
      }
    }
    if (addLng) {
      lng3++;
      if (lng3 > 9) {
        lng2++;
        lng3 = 0;
      }
      if (lng2 > 7) {
        lng1++;
        lng2 = 0;
      }
    }
    return MeshUtil.createMesh('' + lat1 + lng1 + lat2 + lng2 + lat3 + lng3);
  }
  MeshUtil.addMeshCode = addMeshCode;
})(MeshUtil || (MeshUtil = {}));

('use strict');
Number.isNaN =
  Number.isNaN ||
  function(value) {
    // return typeof value === 'number' && isNaN(value);
    return typeof value === 'number' && value !== value;
  };
var isNumber = function(value) {
  return typeof value === 'number' && isFinite(value);
};
var Util;
(function(Util) {
  function defaultString(val, def) {
    if (def === void 0) {
      def = '';
    }
    if (val == null) {
      return def;
    }
    return String(val);
  }
  Util.defaultString = defaultString;
  function defaultInt(val, def) {
    if (def === void 0) {
      def = 0;
    }
    if (val == null) {
      return def;
    }
    if (Number.isNaN(parseInt('' + val))) {
      return def;
    }
    return val;
  }
  Util.defaultInt = defaultInt;
  function defaultFloat(val, def) {
    if (def === void 0) {
      def = 0.0;
    }
    if (val == null) {
      return def;
    }
    var i = parseFloat(val);
    if (Number.isNaN(i)) {
      return def;
    }
    return i;
  }
  Util.defaultFloat = defaultFloat;
  function obj(obj, key, def) {
    if (obj === void 0) {
      return def;
    }
    if (obj != null && obj.hasOwnProperty(key)) {
      return obj[key];
    }
    return def;
  }
  Util.obj = obj;
  function objString(obj, key, def) {
    if (def === void 0) {
      def = '';
    }
    if (obj != null && obj.hasOwnProperty(key)) {
      return String(obj[key]);
    }
    return def;
  }
  Util.objString = objString;
  function objInt(obj, key, def) {
    if (def === void 0) {
      def = 0;
    }
    if (obj != null && obj.hasOwnProperty(key)) {
      if (obj[key] == null && isNaN(obj[key])) {
        return def;
      }
      return parseInt(obj[key]);
    }
    return def;
  }
  Util.objInt = objInt;
  function objFloat(obj, key, def) {
    if (def === void 0) {
      def = 0;
    }
    if (obj != null && obj.hasOwnProperty(key)) {
      if (isNaN(obj[key])) {
        return def;
      }
      return parseFloat(obj[key]);
    }
    return def;
  }
  Util.objFloat = objFloat;
  function isNumber(val) {
    return typeof val === 'number' && isFinite(val);
  }
  Util.isNumber = isNumber;
  function listUniq(list) {
    return list.filter(function(val, i, arr) {
      return arr.indexOf(val) === i;
    });
  }
  Util.listUniq = listUniq;
  function getParam() {
    var search = location.search;
    var param = {};
    if (search.indexOf('?') !== -1) {
      search
        .split('?')[1]
        .split('&')
        .forEach(function(value) {
          var item = value.split('=');
          if (item.length === 2) {
            var key = item[0];
            var val = item[1];
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
  Util.getParam = getParam;
  function extend(obj) {
    var obj2 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      obj2[_i - 1] = arguments[_i];
    }
    var result = obj || {};
    for (var i = 0; i < arguments.length; i++) {
      if (!arguments[i]) {
        continue;
      }
      var value = arguments[i];
      for (var key in value) {
        if (value.hasOwnProperty(key)) {
          result[key] = value[key];
        }
      }
    }
    return result;
  }
  Util.extend = extend;
  function promiseJson(url, cache) {
    if (cache === void 0) {
      cache = true;
    }
    return $.ajax({
      dataType: 'json',
      url: url,
      cache: cache
    });
  }
  Util.promiseJson = promiseJson;
  function promiseWhen(promiseList) {
    return $.when.apply(null, promiseList);
  }
  Util.promiseWhen = promiseWhen;
  function promiseResolve(promise) {
    var dfd = $.Deferred();
    promise
      .done(function() {
        // dfd.resolve(arguments);
      })
      .fail(function() {
        // dfd.resolve(arguments);
      })
      .always(function() {
        dfd.resolve(arguments);
      });
    return dfd.promise();
  }
  Util.promiseResolve = promiseResolve;
})(Util || (Util = {}));
