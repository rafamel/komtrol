import React from 'react';

const {
  Provider: KompiProvider,
  Consumer: KompiConsumer
} = React.createContext();
KompiProvider.displayName = 'KompiProvider';
KompiConsumer.displayName = 'KompiConsumer';

export { KompiProvider, KompiConsumer };
