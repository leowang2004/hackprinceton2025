import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import CircularProgress from '../components/CircularProgress';

const CreditScoreScreen = ({route}) => {
  const {creditScore = 0, transactionCount = 0} = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Alternative Credit Score</Text>

        <View style={styles.scoreContainer}>
          <CircularProgress score={creditScore} maxScore={850} />
        </View>

        <Text style={styles.subtitle}>Based on your Amazon transaction history</Text>

        {transactionCount > 0 && (
          <Text style={styles.transactionText}>
            Analyzed {transactionCount} transactions
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 80,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#000',
  },
  scoreContainer: {
    marginVertical: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  transactionText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default CreditScoreScreen;
