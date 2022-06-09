import { Asset } from 'stellar-sdk';
import { STELLAR_ASSET_TYPE } from 'src/constants/stellarAssetType';

export const getAsset = (symbol: string, issuer: string, type: number): Asset => {
  return type === STELLAR_ASSET_TYPE.NATIVE ? Asset.native() : new Asset(symbol, issuer);
};
