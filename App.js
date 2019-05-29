import React, { Fragment } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { IntentLauncherAndroid, Location, MapView, Permissions } from 'expo';
import { Constants } from 'expo';

// This is where we'll center our map if we don't have any other location to go to.
const defaultLocation = {
  latitude: 44.2612759,
  longitude: -72.5835662,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default class MapExample extends React.Component {

  // Set the component's default state
  state = { userLocation: {}, markerLocations: [] };

  componentDidMount() {
    // Get the user's current location (latitude and longitude)
    this.getLocationAsync();
  }


  getLocationAsync = async () => {
    // Ask for permissions to access the phone's GPS ( we only need to do this once)
    const { status } = await Permissions.askAsync(Permissions.LOCATION);

    // If we have permission then get the user's current location 

    if (status === 'granted') {
      const locationProviderStatus = await Location.getProviderStatusAsync();

      // Check to see if the phone has GPS and it is enabled
   
      if (locationProviderStatus.locationServicesEnabled === false) {
           // GPS is disabled  :-(  Put an annoying error message into the component's state to show later
        this.setState({
          errorMessage:
            'Access to the device location is required. Please make sure you have location services on and you grant access when requested.',
        });
      } else {

        // Huzzah, we have permission to use the GPS and it's enabled
        // Let's get the user's current location (latitude and longitude)
        const myLocation = await Location.getCurrentPositionAsync({});

        //  Put the user's location into the component's state.
        this.setState({ userLocation: myLocation });

        // Start listening to the event that tells us when the user has changed location.
        Location.watchPositionAsync(
          { timeInterval: 3000, distanceInterval: 20 },
          myLocation => {
            // Update the component's state with the user's new location
            this.setState({ errorMessage: null, userLocation: myLocation });
          }
        );
      }
    } else {
          // Permission is not granted :-(  Put an annoying error message into the component's state to show later
      this.setState({
        errorMessage:
          'Access to the device location is required. Please make sure you have location services on and you grant access when requested.',
      });
    }
  };

  // If the map region (area shown on the map, (lat, long and zoom level)) changes
  // save it to component state so our map doesn't jump around when we re-render the map
  onRegionChange = (region) => {
    this.setState({ region });
  }

  // If the map is tapped, save the lat and long so we know where to put a pin
  handleMapTap = event =>{this.setState({markerLocations: this.state.markerLocations.concat(event.nativeEvent.coordinate)})}

  render() {
    // This is our map marker (Pin)
    const markers = this.state.markerLocations.map( (location, index) => 
      <MapView.Marker
        coordinate={location}
        description={'Tap Here To Remove'}
        key ={index}
        onCalloutPress={() => this.removePin(index)}
        pinColor={'green'}
        stopPropagation={true}
        title={`Pin ${index}`}
      />
    );
    // Render our map using all our component state variables
    return (
      <MapView
        initialRegion={defaultLocation}
        showsCompass={true}
        showsMyLocationButton={true}
        showsUserLocation={true}
        region={this.state.region}
        onRegionChange={this.onRegionChange}
        onPress={this.handleMapTap}
        style={{
          height: '100%',
          width: '100%',
          padding: 0,
          borderTopWidth: 0.5,
          borderTopColor: '#AAA',
        }}>
        {markers}
      </MapView>
    );
  }
}

const styles = StyleSheet.create({});
