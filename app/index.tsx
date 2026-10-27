import { StyleSheet, Text, View } from 'react-native';
import { oyunlar } from '../src/games/registry';

export default function Ana() {
  return (
    <View style={stil.kok}>
      <Text style={stil.baslik}>Kafadar</Text>
      {oyunlar.map((oyun) => (
        <Text key={oyun.id} style={stil.oyun}>
          {oyun.ad}
        </Text>
      ))}
    </View>
  );
}

const stil = StyleSheet.create({
  kok: {
    flex: 1,
    backgroundColor: '#0b0b12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baslik: { color: '#fff', fontSize: 32, fontWeight: '700', marginBottom: 16 },
  oyun: { color: '#fff', fontSize: 20 },
});
