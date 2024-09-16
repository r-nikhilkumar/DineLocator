declare namespace google.maps.places {
    class Autocomplete {
      constructor(inputField: HTMLInputElement, opts?: object);
      getPlace(): google.maps.places.PlaceResult;
      addListener(eventName: string, handler: Function): void;
    }
  }
  