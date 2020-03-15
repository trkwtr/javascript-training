
class Mesh {

  /** メッシュコード */
  meshCode: string;
  /** メッシュ範囲 */
  extent: ol.Extent;

  /** 緯度1 */
  lat1: number;
  /** 経度1 */
  lng1: number;
  /** 緯度2 */
  lat2: number;
  /** 経度2 */
  lng2: number;
  /** 緯度3 */
  lat3: number;
  /** 経度3 */
  lng3: number;

  /**
   * コンストラクタ
   * @param meshCode {string} メッシュコード
   * @param extent {ol.Extent} 範囲
   */
  constructor(meshCode: string, extent: ol.Extent) {
    this.meshCode = meshCode;
    this.extent = extent;

    this.lat1 = parseInt(meshCode.substr(0, 2));
    this.lng1 = parseInt(meshCode.substr(2, 2));
    this.lat2 = parseInt(meshCode.substr(4, 1));
    this.lng2 = parseInt(meshCode.substr(5, 1));
    this.lat3 = parseInt(meshCode.substr(6, 1));
    this.lng3 = parseInt(meshCode.substr(7, 1));
  }

  public before(mesh: Mesh): boolean {
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
  }

  public after(mesh: Mesh): boolean {
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
  }
}
