import apiConfig from '@/config/api';
import { useMemo, useState } from 'react';
import { Image, ImageProps, ImageSourcePropType } from 'react-native';

const defaultProductImage = require('../assets/images/partial-react-logo.png');

type ProductImageProps = Omit<ImageProps, 'source'> & {
  productId?: string | null;
  userToken?: string | null;
  cacheKey?: string | number;
};

function getProductImageSource(
  productId?: string | null,
  userToken?: string | null,
  cacheKey?: string | number,
): ImageSourcePropType {
  if (!productId || !userToken || !apiConfig.baseURL) {
    return defaultProductImage;
  }

  const imageUrl = new URL(`${apiConfig.baseURL}${apiConfig.endpoints.produits}/${productId}/images`);
  if (cacheKey != null) {
    imageUrl.searchParams.set('t', String(cacheKey));
  }

  return {
    uri: imageUrl.toString(),
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  };
}

export function ProductImage({ productId, userToken, cacheKey, onError, ...imageProps }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  const remoteSource = useMemo(
    () => getProductImageSource(productId, userToken, cacheKey),
    [cacheKey, productId, userToken],
  );

  const source = hasError ? defaultProductImage : remoteSource;

  return (
    <Image
      {...imageProps}
      source={source}
      onError={(event) => {
        setHasError(true);
        onError?.(event);
      }}
    />
  );
}