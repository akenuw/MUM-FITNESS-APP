/**
 * Connection Status Component
 *
 * This component displays the current connection status
 * and provides troubleshooting tips if there are issues.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getTroubleshootingTips, testApiConnection } from '../utils/connectionHelper';
import { useNetwork } from './NetworkProvider';

const ConnectionStatus = () => {
  const { setApiConnected } = useNetwork();
  const [connectionStatus, setConnectionStatus] = useState({
    isChecking: true,
    isConnected: false,
    error: null
  });
  const [showTips, setShowTips] = useState(false);

  // Check connection on mount
  useEffect(() => {
    checkConnection();

    // Set up interval to check connection every 10 seconds
    const interval = setInterval(checkConnection, 10000);

    return () => clearInterval(interval);
  }, []);

  // Function to check connection
  const checkConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, isChecking: true }));

    try {
      const result = await testApiConnection();

      // Update connection status
      setConnectionStatus({
        isChecking: false,
        isConnected: result.success,
        error: result.success ? null : result.error
      });

      // Update the network context
      setApiConnected(result.success);
    } catch (error) {
      setConnectionStatus({
        isChecking: false,
        isConnected: false,
        error: error.message
      });

      // Update the network context
      setApiConnected(false);
    }
  };

  // Get troubleshooting tips
  const tips = connectionStatus.error ? getTroubleshootingTips(connectionStatus.error) : [];

  // If connected, don't show anything
  if (connectionStatus.isConnected && !connectionStatus.isChecking) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <View style={styles.statusContent}>
          {connectionStatus.isChecking ? (
            <>
              <Ionicons name="sync" size={18} color="white" style={styles.spinningIcon} />
              <Text style={styles.statusText}>Checking connection...</Text>
            </>
          ) : (
            <>
              <Ionicons name="warning" size={18} color="white" />
              <Text style={styles.statusText}>
                {connectionStatus.error || 'Connection issue'}
              </Text>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowTips(!showTips)}
        >
          <Text style={styles.buttonText}>
            {showTips ? 'Hide Tips' : 'Show Tips'}
          </Text>
        </TouchableOpacity>
      </View>

      {showTips && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Troubleshooting Tips:</Text>
          {tips.map((tip, index) => (
            <Text key={index} style={styles.tipText}>
              • {tip}
            </Text>
          ))}
          <TouchableOpacity
            style={styles.retryButton}
            onPress={checkConnection}
          >
            <Text style={styles.retryButtonText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  statusBar: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  spinningIcon: {
    // Animation would be added in a real implementation
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  tipsContainer: {
    backgroundColor: '#FFEBE9',
    padding: 12,
  },
  tipsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FF3B30',
  },
  tipText: {
    marginBottom: 4,
    color: '#333',
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default ConnectionStatus;
