import { Account, Asset, Keypair, Operation, Server, Transaction, TransactionBuilder } from 'stellar-sdk';
import { HardwareWalletType } from 'src/features/OrderForm/constants/hardwareWallet';
import transformTrezorTransaction from 'src/features/OrderForm/helpers/transformTrezorTransaction';
import TrezorConnect from 'trezor-connect';
import BigNumber from 'bignumber.js';
import { Ledger, Trezor } from 'src/features/ConnectWallet/constants/hardwareWallet';
import Str from '@ledgerhq/hw-app-str';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { STELLAR_ASSET_TYPE } from 'src/constants/stellarAssetType';
import { Behaviour } from '../constants/behaviour';
import { Pair } from 'src/pages/Pair/interfaces/pairs';

const server = new Server(`${process.env.REACT_APP_HORIZON}`);
const networkPassphrase = process.env.REACT_APP_NETWORK_PASSPHRASE;
const offerIdForNewOffer = '0';

export const getAsset = (symbol: string, issuer: string, type: number): Asset => {
  return type === STELLAR_ASSET_TYPE.NATIVE ? Asset.native() : new Asset(symbol, issuer);
};

export const buildTxCreateBuyOffer = async (
  amount: number,
  price: number,
  baseAsset: Asset,
  targetAsset: Asset,
  sourceAccount: Account,
  hardwareWalletType: HardwareWalletType | null,
  offerId = '0',
  exchangeFeeRate = '0',
): Promise<Transaction> => {
  const fee = (await server.fetchBaseFee()).toString();

  // with fee
  if (new BigNumber(exchangeFeeRate).gt('0')) {
    if (hardwareWalletType === HardwareWalletType.TREZOR || hardwareWalletType === HardwareWalletType.LEDGER) {
      return new TransactionBuilder(sourceAccount, {
        fee,
        networkPassphrase,
      })
        .addOperation(
          Operation.manageSellOffer({
            buying: baseAsset,
            selling: targetAsset,
            amount: new BigNumber(amount).times(price).times(new BigNumber(1).minus(exchangeFeeRate)).toFixed(7),
            price: new BigNumber(1).dividedBy(price).toFixed(7),
            offerId,
          }),
        )
        .addOperation(
          Operation.payment({
            destination: `${process.env.REACT_APP_STELLAR_EXCHANGE_ACCOUNT}`,
            asset: targetAsset,
            amount: new BigNumber(amount).times(price).times(exchangeFeeRate).toFixed(7),
          }),
        )
        .setTimeout(30)
        .build();
    }

    return new TransactionBuilder(sourceAccount, {
      fee,
      networkPassphrase,
    })
      .addOperation(
        Operation.manageBuyOffer({
          buying: baseAsset,
          selling: targetAsset,
          buyAmount: new BigNumber(amount).times(new BigNumber(1).minus(exchangeFeeRate)).toFixed(7),
          price: new BigNumber(price).toFixed(7),
          offerId,
        }),
      )
      .addOperation(
        Operation.payment({
          destination: `${process.env.REACT_APP_STELLAR_EXCHANGE_ACCOUNT}`,
          asset: targetAsset,
          amount: new BigNumber(amount).times(price).times(exchangeFeeRate).toFixed(7),
        }),
      )
      .setTimeout(30)
      .build();
  }

  // without fee
  if (hardwareWalletType === HardwareWalletType.TREZOR || hardwareWalletType === HardwareWalletType.LEDGER) {
    return new TransactionBuilder(sourceAccount, {
      fee,
      networkPassphrase,
    })
      .addOperation(
        Operation.manageSellOffer({
          buying: baseAsset,
          selling: targetAsset,
          amount: new BigNumber(amount).times(price).toFixed(7),
          price: new BigNumber(1).dividedBy(price).toFixed(7),
          offerId,
        }),
      )
      .setTimeout(30)
      .build();
  }

  return new TransactionBuilder(sourceAccount, {
    fee,
    networkPassphrase,
  })
    .addOperation(
      Operation.manageBuyOffer({
        buying: baseAsset,
        selling: targetAsset,
        buyAmount: new BigNumber(amount).toFixed(7),
        price: new BigNumber(price).toFixed(7),
        offerId,
      }),
    )
    .setTimeout(30)
    .build();
};

export const buildTxCreateSellOffer = async (
  amount: number,
  price: number,
  baseAsset: Asset,
  targetAsset: Asset,
  sourceAccount: Account,
  hardwareWalletType: HardwareWalletType | null,
  offerId = '0',
  exchangeFeeRate = '0',
): Promise<Transaction> => {
  const fee = (await server.fetchBaseFee()).toString();

  // with fee
  if (new BigNumber(exchangeFeeRate).gt('0')) {
    return new TransactionBuilder(sourceAccount, {
      fee,
      networkPassphrase,
    })
      .addOperation(
        Operation.manageSellOffer({
          selling: baseAsset,
          buying: targetAsset,
          amount: new BigNumber(amount).times(new BigNumber(1).minus(exchangeFeeRate)).toFixed(7),
          price: new BigNumber(price).toFixed(7),
          offerId,
        }),
      )
      .addOperation(
        Operation.payment({
          destination: `${process.env.REACT_APP_STELLAR_EXCHANGE_ACCOUNT}`,
          asset: baseAsset,
          amount: new BigNumber(amount).times(exchangeFeeRate).toFixed(7),
        }),
      )
      .setTimeout(30)
      .build();
  }

  // without fee
  return new TransactionBuilder(sourceAccount, {
    fee,
    networkPassphrase,
  })
    .addOperation(
      Operation.manageSellOffer({
        selling: baseAsset,
        buying: targetAsset,
        amount: new BigNumber(amount).toFixed(7),
        price: new BigNumber(price).toFixed(7),
        offerId,
      }),
    )
    .setTimeout(30)
    .build();
};

const buyOffer = async (
  amount: number,
  price: number,
  baseAsset: Asset,
  targetAsset: Asset,
  keyPair: Keypair,
  path: string | null,
  hardwareWalletType: HardwareWalletType | null,
  exchangeFeeRate = '0',
) => {
  // TODO: catch exception when account is not active
  const account = await server.loadAccount(keyPair.publicKey());
  const sourceAccount = new Account(account.accountId(), account.sequenceNumber());
  const transaction = await buildTxCreateBuyOffer(
    amount,
    price,
    baseAsset,
    targetAsset,
    sourceAccount,
    hardwareWalletType,
    offerIdForNewOffer,
    exchangeFeeRate,
  );

  // sign
  if (hardwareWalletType === HardwareWalletType.TREZOR) {
    try {
      const trezorTransaction = transformTrezorTransaction(path || Trezor.defaultStellarPath, transaction);
      const result = await TrezorConnect.stellarSignTransaction(trezorTransaction);
      if (result.success) {
        // convert hex to base64
        const signature = Buffer.from(result.payload.signature, 'hex').toString('base64');
        transaction.addSignature(keyPair.publicKey(), signature);
      }
    } catch (e) {
      throw e.response.data;
      // return JSON.stringify(e);
    }
  } else if (hardwareWalletType === HardwareWalletType.LEDGER) {
    try {
      const transport = await TransportWebUSB.request();
      const str = new Str(transport);
      const result = await str.signTransaction(path || Ledger.defaultStellarPath, transaction.signatureBase());
      // convert uint8array to base64
      const signature = Buffer.from(result.signature).toString('base64');
      transaction.addSignature(keyPair.publicKey(), signature);
    } catch (e) {
      throw e.response.data;
      // return JSON.stringify(e);
    }
  } else {
    transaction.sign(keyPair);
  }

  // submit
  try {
    return await server.submitTransaction(transaction);
  } catch (e) {
    throw e.response.data.extras.result_codes.operations;
    // return JSON.stringify(e.response, null, 2);
  }
};

const sellOffer = async (
  amount: number,
  price: number,
  baseAsset: Asset,
  targetAsset: Asset,
  keyPair: Keypair,
  path: string | null,
  hardwareWalletType: HardwareWalletType | null,
  exchangeFeeRate = '0',
) => {
  // TODO: catch exception when account is not active
  const account = await server.loadAccount(keyPair.publicKey());
  const sourceAccount = new Account(account.accountId(), account.sequenceNumber());
  const transaction = await buildTxCreateSellOffer(
    amount,
    price,
    baseAsset,
    targetAsset,
    sourceAccount,
    hardwareWalletType,
    offerIdForNewOffer,
    exchangeFeeRate,
  );

  // sign
  if (hardwareWalletType === HardwareWalletType.TREZOR) {
    const trezorTransaction = transformTrezorTransaction(path || Trezor.defaultStellarPath, transaction);
    const result = await TrezorConnect.stellarSignTransaction(trezorTransaction);
    if (result.success) {
      // convert to base64
      const signature = Buffer.from(result.payload.signature, 'hex').toString('base64');
      transaction.addSignature(keyPair.publicKey(), signature);
    }
  } else if (hardwareWalletType === HardwareWalletType.LEDGER) {
    try {
      const transport = await TransportWebUSB.request();
      const str = new Str(transport);
      const result = await str.signTransaction(path || Ledger.defaultStellarPath, transaction.signatureBase());
      // convert uint8array to base64
      const signature = Buffer.from(result.signature).toString('base64');
      transaction.addSignature(keyPair.publicKey(), signature);
    } catch (e) {
      throw e.response.data;
      // return JSON.stringify(e);
    }
  } else {
    transaction.sign(keyPair);
  }

  // submit
  try {
    return await server.submitTransaction(transaction);
  } catch (e) {
    throw e.response.data.extras.result_codes.operations;
    // return JSON.stringify(e.response, null, 2);
  }
};

export const sendStellarOffer = async (
  behaviour: string,
  amount: number,
  price: number,
  selectedPair: Pair,
  hardwareWalletType: HardwareWalletType | null,
  path: string | null,
  publicKey: string | null,
  secret: string | null,
  exchangeFeeRate = '0',
): Promise<unknown> => {
  const keyPair = secret ? Keypair.fromSecret(secret) : publicKey ? Keypair.fromPublicKey(publicKey) : null;

  const baseAsset = getAsset(selectedPair.base_symbol, selectedPair.base_stellar_issuer, selectedPair.base_type);
  const targetAsset = getAsset(selectedPair.quote_symbol, selectedPair.quote_stellar_issuer, selectedPair.quote_type);

  if (behaviour === Behaviour.BUY && keyPair) {
    return await buyOffer(amount, price, baseAsset, targetAsset, keyPair, path, hardwareWalletType, exchangeFeeRate);
  } else if (behaviour === Behaviour.SELL && keyPair) {
    return await sellOffer(amount, price, baseAsset, targetAsset, keyPair, path, hardwareWalletType, exchangeFeeRate);
  }
};
