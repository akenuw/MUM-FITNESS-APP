import NetInfo from '@react-native-community/netinfo';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

// Create context
const NetworkContext = createContext({
  isConnected: true,
  apiConnected: false,
});

// Custom hook to use network context
export const useNetwork = () => useContext(NetworkContext);

// Network provider component
export const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connectionStatus = state.isConnected && state.isInternetReachable;
      setIsConnected(connectionStatus);

      // Show banner when disconnected
      if (!connectionStatus) {
        setShowBanner(true);
      } else {
        // Hide banner after a delay when connected
        setTimeout(() => {
          setShowBanner(false);
        }, 2000);
      }
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected, apiConnected, setApiConnected }}>
      {children}

      {/* Network status banner removed to avoid showing errors */}

      {/* Connection status removed to avoid showing errors */}
    </NetworkContext.Provider>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  offlineBanner: {
    backgroundColor: '#FF3B30',
  },
  onlineBanner: {
    backgroundColor: '#4CD964',
  },
  bannerText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NetworkProvider;
