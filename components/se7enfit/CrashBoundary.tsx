import React from 'react';
import { Text, View } from 'react-native';
import Button from './Button';
import Logo from './Logo';

type State = {
  hasError: boolean;
  message?: string;
};

export default class CrashBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[SE7EN FIT runtime error]', error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, message: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={{ flex: 1, backgroundColor: '#020403', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Logo size={30} />
        <Text style={{ color: '#F4FFF7', fontSize: 20, fontWeight: '800', marginTop: 24, textAlign: 'center' }}>
          Something went wrong
        </Text>
        <Text style={{ color: '#8C958E', fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
          The app hit a screen error. Please reopen the screen or restart the app.
        </Text>
        {this.state.message ? (
          <Text style={{ color: '#EF4444', fontSize: 11, marginTop: 12, textAlign: 'center' }} numberOfLines={3}>
            {this.state.message}
          </Text>
        ) : null}
        <View style={{ marginTop: 24, width: '100%' }}>
          <Button label="Try Again" onPress={this.reset} />
        </View>
      </View>
    );
  }
}
