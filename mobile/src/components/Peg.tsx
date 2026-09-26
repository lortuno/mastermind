import { StyleSheet, Text, View } from 'react-native';
import { findColor } from '@mastermind/core';
import { palette } from '../theme';

type Props = {
  letter: string;
  size: number;
};

// Read-only peg used in the attempt log and the secret reveal; the parent
// row supplies the accessible description.
export default function Peg({ letter, size }: Props) {
  const color = findColor(letter);

  return (
    <View
      style={[
        styles.peg,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color?.hex ?? palette.surface },
      ]}
    >
      <Text style={[styles.letter, { color: color?.textHex ?? palette.text, fontSize: size * 0.45 }]}>{letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  peg: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontWeight: '700',
  },
});
