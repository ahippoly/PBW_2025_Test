# Parcel Map Viewer

A React component for viewing and interacting with cadastral parcel data using MapTiler maps.

## Features

- Display cadastral parcels on a map
- Hover over parcels to see their properties
- Click on parcels to pin information
- Highlight specific parcels in different colors (whitelist)
- Callback for parcel selection events

## Installation

1. Install the required dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

## Usage

The `MapView` component can be used in any React application. Here's a basic example:

```jsx
import MapView from "./components/MapView";

function App() {
  const handleParcelSelect = (parcelProperties) => {
    console.log("Selected parcel:", parcelProperties);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <MapView
        apiKey="YOUR_MAPTILER_API_KEY"
        center={[2.3522, 48.8566]} // Paris coordinates
        zoom={13}
        whiteListedParcels={["75104000AO0037", "75104000AO0038"]}
        onParcelSelect={handleParcelSelect}
      />
    </div>
  );
}
```

## Props

| Prop               | Type             | Default           | Description                                            |
| ------------------ | ---------------- | ----------------- | ------------------------------------------------------ |
| apiKey             | string           | required          | Your MapTiler API key                                  |
| center             | [number, number] | [2.3522, 48.8566] | Initial map center coordinates [lng, lat]              |
| zoom               | number           | 13                | Initial map zoom level                                 |
| whiteListedParcels | string[]         | []                | Array of parcel IDs to highlight in green              |
| onParcelSelect     | function         | undefined         | Callback function when a parcel is selected/deselected |

## License

MIT
