import { Account, Asset, Keypair, Server } from 'stellar-sdk';
import { buildTxCreateBuyOffer } from 'src/features/OrderForm/helpers/sendStellarOffer';
import { HardwareWalletType } from 'src/features/OrderForm/constants/hardwareWallet';
import transformTrezorTransaction from 'src/features/OrderForm/helpers/transformTrezorTransaction';
import { Ledger, Trezor } from 'src/features/ConnectWallet/constants/hardwareWallet';
import TrezorConnect from 'trezor-connect';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import Str from '@ledgerhq/hw-app-str';
import { Pair } from 'src/pages/Pair/interfaces/pairs';

export const cancelStellarOffer = async (
  path: string | null,
  hardwareWalletType: HardwareWalletType | null,
  offerId: string,
  publicKey: string | null,
  secret: string | null,
  pair?: Pair | null,
): Promise<unknown> => {
  // TODO: cause an exception when there's no account
  const keyPair = publicKey ? Keypair.fromPublicKey(publicKey) : Keypair.fromSecret(secret || '');
  const server = new Server(`${process.env.REACT_APP_HORIZON}`);
  const account = await server.loadAccount(keyPair.publicKey());
  const baseAsset = pair ? new Asset(pair.base_symbol, pair.base_stellar_issuer) : Asset.native();
  const targetAsset = pair ? new Asset(pair.quote_symbol, pair.quote_stellar_issuer) : Asset.native();
  const sourceAccount = new Account(account.accountId(), account.sequenceNumber());
  const transaction = await buildTxCreateBuyOffer(0, 1, baseAsset, targetAsset, sourceAccount, null, offerId);

  //sign
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
      throw e;
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
      throw e;
    }
  } else {
    transaction.sign(keyPair);
  }

  // submit
  try {
    return await server.submitTransaction(transaction);
  } catch (e) {
    throw e.response.data.extras.result_codes.operations;
  }
};
