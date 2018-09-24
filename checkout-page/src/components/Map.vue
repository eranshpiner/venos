<template>
    <div>
        <div
                :style="{display: show ? 'block' : 'none'}"
                style="width: 100%; height: 120px; z-index: auto"
                id="map-container"
        ></div>
    </div>
</template>

<style>
    #map-container div:first-child {
        border-radius: 10px;
    }
</style>

<script>
import 'here-js-api/scripts/mapsjs-core';
import 'here-js-api/scripts/mapsjs-service';
import 'here-js-api/scripts/mapsjs-ui';
import 'here-js-api/scripts/mapsjs-mapevents';
import 'here-js-api/scripts/mapsjs-clustering';

const { H, document } = window;

export default {
  data() {
    return {
      show: false,
      lat: 0,
      lng: 0,
    };
  },
  mounted() {
    this.platform = new H.service.Platform({
      app_id: 'nyKybJs4fZYfMCd7jfsx',
      app_code: 'E_xE5837hGk33SL8M6hWIg',
      useCIT: true,
      useHTTPS: true,
    });

    this.geocoder = this.platform.getGeocodingService();
    this.defaultLayers = this.platform.createDefaultLayers();

    this.map = new H.Map(
      document.getElementById('map-container'),
      this.defaultLayers.normal.map,
      {
        center: new H.geo.Point(this.lat, this.lng),
        zoom: 16,
      },
    );
    this.marker = new H.map.Marker({ lat: this.lat, lng: this.lng });
    this.map.addObject(this.marker);
    this.lookup();
  },
  methods: {
    updatePosition() {
      this.show = true;
      const position = { lat: this.lat, lng: this.lng };
      this.marker.setPosition(position);
      this.map.setCenter(new H.geo.Point(this.lat, this.lng));
      this.map.setZoom(15);
      setTimeout(() => this.map.getViewPort().resize(), 200);
    },
    lookup() {
      this.geocoder.geocode(
        { searchText: `${this.street} ${this.houseNumber}, ${this.city}` },
        (result) => {
          if (!result.Response.View[0]) {
            this.show = false;
            return;
          }
          const location = result.Response.View[0].Result[0].Location.DisplayPosition;
          this.lat = location.Latitude;
          this.lng = location.Longitude;
          this.updatePosition();
        }, (err) => {
          this.show = false;
          console.log(err);
        },
      );
    },
  },
  watch: {
    city() {
      this.lookup();
    },
    street() {
      this.lookup();
    },
    houseNumber() {
      this.lookup();
    },
  },
  props: ['city', 'street', 'houseNumber'],
};
</script>
