
export class Map {

  // ============================================================
  /** 球面メルカトル図法 */
  static projectionMercator: string = 'EPSG:3857';
  /** WGS84 */
  static projectionWGS84: string = 'EPSG:4326';

  // ============================================================
  /** 地図 */
  private map: ol.Map;

  /** メッシュレイヤー */
  private meshLayer: ol.layer.Vector;

  // ============================================================
  /** 緯度 */
  private lat: number = 0;
  /** 経度 */
  private lng: number = 0;
  /** ズームレベル */
  private zoom: number = 10;

  /** メッシュコードリスト */
  private meshCodeList: string[] | undefined = [];


  // ============================================================
  /**
   * コンストラクタ
   */
  constructor() {
    // 
  }

  public initMap(lat: number, lng: number, zoom: number) {
    this.lat = lat;
    this.lng = lng;
    this.zoom = zoom;

    this.map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.XYZ({
            attributions: [
              "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
            ],
            url: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
            projection: "EPSG:3857"
          })
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([this.lng, this.lat]),
        zoom: this.zoom,
        minZoom: 11,
        maxZoom: 15,
      }),
      controls: ol.control.defaults({
        attribution: true,
        attributionOptions: {
          collapsible: false,
          collapsed: false,
        }
      })
    });

    // スケール
    this.map.addControl(new ol.control.ScaleLine());

    // メッシュレイヤーを登録
    this.meshLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: Map.meshStyleFunction,
    });
    this.map.addLayer(this.meshLayer);



    this.map.once('moveend', (evt: ol.MapEvent) => {
      //   this.moveEndEvent(evt);
    });

    this.map.on('movestart', (evt: ol.MapEvent) => {
      this.moveStartEvent(evt);
    });

    this.map.on('moveend', (evt: ol.MapEvent) => {
      this.moveEndEvent(evt);
    });

    this.map.on('pointermove', (evt: ol.MapBrowserEvent) => {
      this.pointerMoveEvent(evt);
    });
  }

  public moveStartEvent(evt: ol.MapEvent) {
    // 
  }

  public moveEndEvent(evt: ol.MapEvent) {
    const map: ol.Map = evt.map;
    // const frameState: ol.olx.FrameState = evt.frameState;

    const zoom: number = parseInt('' + map.getView().getZoom());
    if (this.zoom !== zoom) {
      this.zoom = zoom;

      this.mapZoomChange(evt);
    }

    // console.log('zoom', map.getView().getZoom());

    // 範囲
    const extent: ol.Extent = map.getView().calculateExtent(map.getSize());

    const northEast: ol.Coordinate = ol.extent.getTopRight(extent);
    const southWest: ol.Coordinate = ol.extent.getBottomLeft(extent);


    const center = ol.extent.getCenter(MapUtil.toExtent(extent));

    const meshCode = MeshUtil.latLngToMeshCode(center);

    const tempCodeList = _.concat(this.meshCodeList);

    this.meshCodeList = MeshUtil.mapMeshCodeList(map);

    const addMeshCodeList: string[] = _.difference(this.meshCodeList, tempCodeList);
    const delMeshCodeList: string[] = _.difference(tempCodeList, this.meshCodeList);


    this.addMesh(addMeshCodeList);
    this.removeMesh(delMeshCodeList);


  }

  public mapZoomChange(evt: ol.MapEvent) {
    const map = evt.map;

    console.log('mapZoomChange', parseInt('' + map.getView().getZoom()));
    // 
  }

  public pointerMoveEvent(evt: ol.MapBrowserEvent) {
    // const map: ol.Map = evt.map;
    const coordinate: ol.Coordinate = evt.coordinate;

    const latLng = ol.proj.toLonLat(coordinate);
    // $('#latLng').val(MapUtil.toStringXY(latLng, 2));

    const meshCode: string | undefined = MeshUtil.latLngToMeshCode(latLng);
    // $('#meshCode').val(meshCode);

    const latLng2: ol.Coordinate | undefined = MeshUtil.meshCodeToLatLng(meshCode);
    // $('#latLng2').val(MapUtil.toStringXY(latLng2, 2));
  }

  public addMesh(meshCodeList: string[]) {
    if (meshCodeList != null && meshCodeList.length > 0) {
      const source: ol.source.Vector = this.meshLayer.getSource();

      meshCodeList.forEach((meshCode: string) => {
        try {
          const feature: ol.Feature = this.createMeshFeature(meshCode);
          if (feature != null) {
            source.addFeature(feature);
          }
        } catch (error) {
          console.log(error);
        }
      });
    }
  }

  public removeMesh(meshCodeList: string[]) {
    if (meshCodeList != null && meshCodeList.length > 0) {
      const source: ol.source.Vector = this.meshLayer.getSource();

      meshCodeList.forEach((meshCode: string) => {
        const feature: ol.Feature = source.getFeatureById(meshCode);
        if (feature != null) {
          source.removeFeature(feature);
        }
      });
    }
  }

  public createMeshFeature(meshCode: string): ol.Feature {
    // console.log('createMeshFeature()', meshCode);

    // const polygon: ol.geom.Polygon = this.createMeshPolygon(meshCode);
    // console.log(polygon);

    const extent: ol.Extent = MapUtil.fromExtent(MapUtil.meshCodeToExtent(meshCode));

    const northEast: ol.Coordinate = ol.extent.getTopRight(extent);
    const southWest: ol.Coordinate = ol.extent.getBottomLeft(extent);

    const north: number = MapUtil.lat(northEast);
    const east: number = MapUtil.lng(northEast);
    const south: number = MapUtil.lat(southWest);
    const west: number = MapUtil.lng(southWest);

    const geometry = [[
      MapUtil.latLng(north, west),
      MapUtil.latLng(north, east),
      MapUtil.latLng(south, east),
      MapUtil.latLng(south, west),
      MapUtil.latLng(north, west)
    ]]

    const polygon: ol.geom.Polygon = new ol.geom.Polygon(geometry);

    const feature: ol.Feature = new ol.Feature(polygon);
    // feature.setGeometry(geometry);
    feature.setId(meshCode);

    return feature;
  }

  /**
   * メッシュスタイル関数
   * @param feature {ol.Feature}
   */
  static meshStyleFunction(feature: ol.Feature): ol.style.Style {

    const r: number = parseInt('' + 255 * Math.random());
    const g: number = parseInt('' + 255 * Math.random());
    const b: number = parseInt('' + 255 * Math.random());
    // console.log(r, g, b);

    const zIndex: number = Math.random() * 10;

    const red: string = ('00' + (r.toString(16))).slice(-2);
    const green: string = ('00' + (g.toString(16))).slice(-2);
    const blue: string = ('00' + (b.toString(16))).slice(-2);
    const color: string = '#' + red + green + blue;

    const rgba: string = 'rgba(' + r + ',' + g + ',' + b + ',.2)';

    // スタイル
    const style = new ol.style.Style({
      fill: new ol.style.Fill({
        color: rgba,
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(0,0,0,1)',
        width: 2,
      }),
      text: new ol.style.Text({
        text: '' + feature.getId()
      }),
      zIndex: zIndex,
    });

    return style;
  }
}
