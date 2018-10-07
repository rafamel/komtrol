import React from 'react';

const {
  Provider: KomfuProvider,
  Consumer: KomfuConsumer
} = React.createContext();
KomfuProvider.displayName = 'KomfuProvider';
KomfuConsumer.displayName = 'KomfuConsumer';

export { KomfuProvider, KomfuConsumer };
