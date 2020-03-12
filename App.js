// import { AppAuth } from 'expo-app-auth';
import * as AppAuth from 'expo-app-auth';
// import * as AppAuth from 'expo-google-app-auth';
import * as GoogleSignIn from 'expo-google-sign-in';

import * as Constants from 'expo-constants';
import React from 'react';
import { Image, StyleSheet, Text, View, Platform } from 'react-native';

import GoogleSignInButton from './GoogleSignInButton';
import GoogleProfile from './components/GoogleProfile'
const { OAuthRedirect, URLSchemes } = AppAuth;

const isInClient = Constants.appOwnership === 'expo';
if (isInClient) {
  GoogleSignIn.allowInClient();
}

const clientIdForUseInTheExpoClient =
  '';

/*
 * Redefine this one with your client ID
 *
 * The iOS value is the one that really matters,
 * on Android this does nothing because the client ID
 * is read from the google-services.json.
 */
const yourClientIdForUseInStandalone = Platform.select({
  android:
    '',
  ios:
    '',
});
const webClientId = ''
const clientId = isInClient
  ? clientIdForUseInTheExpoClient
  : yourClientIdForUseInStandalone;

export default class App extends React.Component {
  state = { user: null };

  async componentDidMount() {
    try {
      await GoogleSignIn.initAsync({
        isOfflineEnabled: true,
        isPromptEnabled: true,
        clientId,
        webClientId
      });
      this._syncUserWithStateAsync();
    } catch ({ message }) {
      alert('[GoogleSignIn][initAsync] message:' + message);
    }
  }

  _syncUserWithStateAsync = async () => {
    const user = await GoogleSignIn.signInSilentlyAsync();
    console.log('[GoogleSignIn][_syncUserWithStateAsync] user:', { user });
    this.setState({ user });
  };

  signOutAsync = async () => {
    try {
      await GoogleSignIn.signOutAsync();
      this.setState({ user: null });
    } catch ({ message }) {
      alert('[GoogleSignIn][signOutAsync] message: ' + message);
    }
  };

  signInAsync = async () => {
    try {
      await GoogleSignIn.askForPlayServicesAsync();
      const { type, user } = await GoogleSignIn.signInAsync();
      if (type === 'success') {
        this._syncUserWithStateAsync();
      }
    } catch ({ message }) {
      alert('[GoogleSignIn][signInAsync] Error:' + message);
    }
  };

  _syncUserWithStateAsync = async () => {
    /*
      const user = await GoogleSignIn.signInSilentlyAsync();
      this.setState({ user });
    */

    const data = await GoogleSignIn.signInSilentlyAsync();
    console.log("[GoogleSignIn][_syncUserWithStateAsync] data:", { data });
    if (data) {
      const photoURL = await GoogleSignIn.getPhotoAsync(256);
      const user = await GoogleSignIn.getCurrentUserAsync();
      this.setState({
        user: {
          ...user.toJSON(),
          photoURL: photoURL || user.photoURL,
        },
      });
    } else {
      this.setState({ user: null });
    }
  };

  get buttonTitle() {
    return this.state.user ? 'Sign-Out of Google' : 'Sign-In with Google';
  }

  render() {
    const scheme = {
      OAuthRedirect,
      URLSchemes,
    };
    const { user } = this.state;
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {user && <GoogleProfile {...user} />}
        <GoogleSignInButton onPress={this._toggleAuth}>
          {this.buttonTitle}
        </GoogleSignInButton>
        <Text>AppAuth: {JSON.stringify(scheme, null, 2)}</Text>
      </View>
    );
  }

  _toggleAuth = () => {
    console.log('Toggle', !!this.state.user);
    if (this.state.user) {
      this._signOutAsync();
    } else {
      this._signInAsync();
    }
  };

  _signOutAsync = async () => {
    try {
      // await GoogleSignIn.disconnectAsync();
      await GoogleSignIn.signOutAsync();
      console.log('[GoogleSignIn][_signOutAsync] Log out successful');
    } catch ({ message }) {
      console.error('[GoogleSignIn][_signOutAsync] Demo: Error: logout: ' + message);
    } finally {
      this.setState({ user: null });
    }
  };

  _signInAsync = async () => {
    try {
      await GoogleSignIn.askForPlayServicesAsync();
      const { type, user } = await GoogleSignIn.signInAsync();
      console.log({ type, user });
      if (type === 'success') {
        this._syncUserWithStateAsync();
      }
    } catch ({ message }) {
      console.error('[GoogleSignIn][_signInAsync] login: Error:' + message);
    }
  };
}

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 24,
//   },
//   image: { width: 128, borderRadius: 64, aspectRatio: 1 },
//   text: { color: 'black', fontSize: 16, fontWeight: '600' },
// });