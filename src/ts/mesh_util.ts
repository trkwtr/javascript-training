
module MeshUtil {

  /**
   * 地図のメッシュリストを取得
   * @param map {ol.Map} 地図
   */
  export function mapMeshCodeList(map: ol.Map): string[] | undefined {
    if (map === void 0) { return; }


    // 地図範囲
    const mapExtent: ol.Extent = MapUtil.toExtent(MapUtil.mapExtent(map));
    // 北東緯度経度
    const northEastLatLng: ol.Coordinate = ol.extent.getTopRight(mapExtent);
    // 南西緯度経度
    const southWestLatLng: ol.Coordinate = ol.extent.getBottomLeft(mapExtent);

    // 北東メッシュコード
    const northEastMeshCode: string | undefined = MeshUtil.latLngToMeshCode(northEastLatLng);
    // 南西メッシュコード
    const southWestMeshCode: string | undefined = MeshUtil.latLngToMeshCode(southWestLatLng);

    const north: number = MapUtil.lat(northEastLatLng);
    const east: number = MapUtil.lng(northEastLatLng);
    const south: number = MapUtil.lat(southWestLatLng);
    const west: number = MapUtil.lng(southWestLatLng);

    const northS: number = north * 3600;
    const eastS: number = east * 3600;
    const southS: number = south * 3600;
    const westS: number = west * 3600;


    const list2: string[] = MeshUtil.extentMeshCodeList(northEastMeshCode, southWestMeshCode);


    const list: string[] = [];

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

  /**
   * Meshを取得
   * @param meshCode 
   */
  export function createMesh(meshCode: string): Mesh | undefined {
    const extent = MeshUtil.meshCodeToExtent(meshCode);
    if (extent == null) {
      return;
    }

    return new Mesh(meshCode, extent);
  }

  /**
   * メッシュコード範囲を取得
   * @param meshCode {string} メッシュコード
   */
  export function meshCodeToExtent(meshCode: string): ol.Extent | undefined {
    const latLng: ol.Coordinate | undefined = MeshUtil.meshCodeToLatLng(meshCode);
    if (latLng == null) {
      return;
    }

    const south: number = latLng[1];
    const west: number = latLng[0];
    const north: number = ((south * 3600) + 30) / 3600;
    const east: number = ((west * 3600) + 45) / 3600;

    return [west, south, east, north];
  }

  /**
   * メッシュコードを座標に変換
   * @param meshCode {string} メッシュコード
   */
  export function meshCodeToLatLng(meshCode: string): ol.Coordinate | undefined {
    if (meshCode === void 0) { return; }

    if (meshCode.length !== 8) {
      return;
    }

    const lat1: number = parseInt(meshCode.substr(0, 2)) / 1.5 * 3600;
    const lng1: number = (parseInt(meshCode.substr(2, 2)) + 100) * 3600;
    const lat2: number = parseInt(meshCode.substr(4, 1)) * 5 * 60;
    const lng2: number = parseInt(meshCode.substr(5, 1)) * 7.5 * 60;
    const lat3: number = parseInt(meshCode.substr(6, 1)) * 30;
    const lng3: number = parseInt(meshCode.substr(7, 1)) * 45;

    return [(lng1 + lng2 + lng3) / 3600, (lat1 + lat2 + lat3) / 3600];
  }

  /**
   * 座標をメッシュコードに変換
   * @param coordinate {ol.Coordinate} 座標
   */
  export function latLngToMeshCode(coordinate: ol.Coordinate): string | undefined {
    if (coordinate === void 0) { return; }

    const lat: number = coordinate[1];
    const lng: number = coordinate[0];

    // if (lat < 20 || 46 < lat) {
    //   return;
    // }
    // if (lng < 122 || 154 < lng) {
    //   return;
    // }

    const mc1lat: number = Math.floor((lat * 60) / 40);
    const mc1lat_mod: number = (lat * 60) % 40;

    const mc2lat: number = Math.floor(mc1lat_mod / 5);
    const mc2lat_mod: number = mc1lat_mod % 5;

    const mc3lat: number = Math.floor((mc2lat_mod * 60) / 30);
    // const mc3lat_mod: number = (mc2lat_amari * 60) % 30;

    const mc1lng: number = Math.floor(lng - 100);
    const mc1lng_mod: number = lng - (100 + mc1lng);

    const mc2lng: number = Math.floor((mc1lng_mod * 60) / 7.5);
    const mc2lng_mod: number = (mc1lng_mod * 60) % 7.5;

    const mc3lng: number = Math.floor((mc2lng_mod * 60) / 45);
    // const mc3lng_mod: number = (mc2lng_amari * 60) % 45;


    // const meshCode: string = '' + mc1lat + mc1lng + mc2lat + mc2lng + mc3lat + mc3lng;

    return '' + mc1lat + mc1lng + mc2lat + mc2lng + mc3lat + mc3lng;
  }

  /**
   * 
   * @param northEastMeshCode 
   * @param southWestMeshCode 
   */
  export function extentMeshCodeList(northEastMeshCode: string, southWestMeshCode: string): string[] | undefined {
    if (northEastMeshCode === void 0) { return; }
    if (southWestMeshCode === void 0) { return; }

    const list: string[] = [];


    const northEast: Mesh | undefined = MeshUtil.createMesh(northEastMeshCode);
    const southWest: Mesh | undefined = MeshUtil.createMesh(southWestMeshCode);
    // console.log(ne, sw);

    // 緯度ループ
    let mesh: Mesh | undefined = MeshUtil.createMesh(southWest.meshCode);
    while (mesh.before(northEast) || MeshUtil.equal(mesh, northEast)) {

      // 経度ループ
      let mesh2: Mesh | undefined = MeshUtil.createMesh(mesh.meshCode);
      while (mesh2.before(northEast) || MeshUtil.equal(mesh2, northEast)) {
        list.push(mesh2.meshCode);

        mesh2 = MeshUtil.addMeshCodeLng(mesh2);
      }

      mesh = MeshUtil.addMeshCodeLat(mesh);
    }

    return list;
  }

  export function equal(mesh1: Mesh, mesh2: Mesh): boolean {
    return mesh1.meshCode === mesh2.meshCode;
  }

  export function addMeshCodeLat(mesh: Mesh): Mesh | undefined {
    return MeshUtil.addMeshCode(mesh, true, false);
  }

  export function addMeshCodeLng(mesh: Mesh): Mesh | undefined {
    return MeshUtil.addMeshCode(mesh, false, true);
  }

  export function addMeshCode(mesh: Mesh, addLat: boolean, addLng: boolean): Mesh | undefined {
    let lat1: number = mesh.lat1;
    let lat2: number = mesh.lat2;
    let lat3: number = mesh.lat3;
    let lng1: number = mesh.lng1;
    let lng2: number = mesh.lng2;
    let lng3: number = mesh.lng3;

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
}