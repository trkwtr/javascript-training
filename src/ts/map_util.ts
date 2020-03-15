
module MapUtil {
  /** 球面メルカトル図法 */
  export const EPSG3857: string = 'EPSG:3857';
  /** 地理座標系 */
  export const EPSG4326: string = 'EPSG:4326';



  export function mapExtent(map: ol.Map) {
    return map.getView().calculateExtent(map.getSize());
  }

  export function lat(coordinate: ol.Coordinate): number {
    return coordinate[1];
  }

  export function lng(coordinate: ol.Coordinate): number {
    return coordinate[0]
  }

  export function latLng(lat: number, lng: number): ol.Coordinate {
    return [lng, lat];
  }

  /**
   * 地理座標系 ← 球面メルカトル図法
   * @param coordinate 
   */
  export function toLonLat(coordinate: ol.Coordinate) {
    // return ol.proj.toLonLat(coordinate);
    return ol.proj.transform(coordinate, MapUtil.EPSG3857, MapUtil.EPSG4326);
  }

  /**
   * 球面メルカトル図法 ← 地理座標系
   * @param coordinate 
   */
  export function fromLonLat(coordinate: ol.Coordinate) {
    // return ol.proj.fromLonLat(coordinate);
    return ol.proj.transform(coordinate, MapUtil.EPSG4326, MapUtil.EPSG3857);
  }

  /**
   * 地理座標系 ← 球面メルカトル図法
   * @param extent 
   */
  export function toExtent(extent: ol.Extent) {
    return ol.proj.transformExtent(extent, MapUtil.EPSG3857, MapUtil.EPSG4326);
  }

  /**
   * 球面メルカトル図法 ← 地理座標系
   * @param extent 
   */
  export function fromExtent(extent: ol.Extent) {
    return ol.proj.transformExtent(extent, MapUtil.EPSG4326, MapUtil.EPSG3857);
  }

  /**
   * 座標をフォーマット
   * @param coordinate {ol.Coordinate} 座標
   * @param template {string} テンプレート 'Coordinate is ({x}|{y}).'
   * @param digits {number} 桁数
   */
  export function format(coordinate: ol.Coordinate, template: string, digits?: number): string {
    return ol.coordinate.format(coordinate, template, 4);
  }

  /**
   * 緯度経度の桁数を調整
   * @param coordinate {ol.Coordinate} 座標
   * @param digits {number} 桁数
   */
  export function toStringXY(coordinate: ol.Coordinate, digits?: number) {
    return ol.coordinate.toStringXY(coordinate, digits)
  }
}
