import React from 'react';
import { Dialog } from '@material-ui/core';
import classNames from 'classnames/bind';
import styles from './BulkActionPopup.module.scss';
import { ReactComponent as CloseIcon } from 'src/assets/icon/close.svg';
import { CButton } from 'src/components/Base/Button';
import WarningPopup from 'src/features/Pools/component/PoolDetail/Settings/LiquidityProvidersSetting/WarningPopup';
import { removeWhitelistedLiquidityProvider, whitelistLiquidityProvider } from '../helper/utils';
import { ISelect } from 'src/components/Base/Select2/Select2';
import { getCrpController } from '../../WeightChangePopup/helper/utils';
import { useAppSelector } from 'src/store/hooks';
import PopupStyles from 'src/features/Pools/component/PoolDetail/Settings/PopupStyles';
import { FastField, Formik, FormikProps } from 'formik';
import SelectField from 'src/components/Form/SelectedField';
import * as yup from 'yup';
import { settingHistoryLog } from 'src/features/Pools/component/PoolDetail/Settings/helper/historyLog';

interface SelectUser {
  userId: string;
  email: string;
  addresses: string[];
  type: number;
  selected: boolean;
}

interface Props {
  poolId: string;
  unWhitelisted: ISelect[];
  listRecordChecked: SelectUser[];
  open: boolean;
  handleClose: () => void;
  loadData: () => void;
  remove?: boolean;
}

const cx = classNames.bind(styles);

const BulkActionPopup: React.FC<Props> = ({
  open,
  handleClose,
  remove = false,
  poolId,
  unWhitelisted,
  listRecordChecked,
  loadData,
}) => {
  const classes = PopupStyles();
  const [openWarningPopup, setOpenWarningPopup] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState<boolean>();
  const wallet = useAppSelector((state) => state.wallet);
  const refFormik = React.useRef<FormikProps<{ selected: SelectUser[] }>>(null);

  const handleCloseBulkAction = () => {
    if (!isLoading) {
      handleClose();
    }
  };

  const isSelectUser = () => {
    for (let i = 0; i < listRecordChecked.length; i++) {
      if (listRecordChecked[i].selected) {
        return true;
      }
    }
    return false;
  };

  const handleSubmit = async () => {
    const selected = refFormik.current?.values.selected;
    setIsLoading(true);
    try {
      const controller = await getCrpController(poolId, 'controller');
      if (!remove) {
        const addresses: Array<string> = [];
        selected?.map((user) => {
          user.addresses.map((address) => {
            addresses.push(address);
          });
        });
        if (addresses.length > 100) {
          setOpenWarningPopup(!openWarningPopup);
          setIsLoading(false);
          return;
        }
        const params = {
          crpAddress: controller,
          provider: addresses,
          account: wallet.bsc,
        };
        await whitelistLiquidityProvider(params);
        await settingHistoryLog({
          pool_setting_name: 'Add liquidity providers',
          pool_id: poolId,
          wallet: wallet.bsc,
        });
      } else {
        const addresses: Array<string> = [];
        listRecordChecked.map((user) => {
          if (user.selected) {
            user.addresses.map((address) => {
              addresses.push(address);
            });
          }
        });
        if (addresses.length > 100) {
          setOpenWarningPopup(!openWarningPopup);
          setIsLoading(false);
          return;
        }
        const params = {
          crpAddress: controller,
          provider: addresses,
          account: wallet.bsc,
        };
        await removeWhitelistedLiquidityProvider(params);
        await settingHistoryLog({
          pool_setting_name: 'Remove liquidity providers',
          pool_id: poolId,
          wallet: wallet.bsc,
        });
      }
      setIsLoading(false);
      await loadData();
      handleCloseBulkAction();
    } catch (e) {
      setIsLoading(false);
    }
  };

  const validationSchema = yup.object({
    selected: yup.array().min(1, 'This field is required.').required('This field is required.'),
  });

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      className={cx('dialog-root')}
      open={open}
      onClose={handleCloseBulkAction}
      PaperProps={{ className: classes.dialogOverflow }}
    >
      <div className={cx('dialog-header')}>
        <div></div>

        <div>{remove ? 'Remove user' : 'Add user'}</div>

        <CloseIcon onClick={handleCloseBulkAction} />
      </div>

      <div className={cx('dialog-body')}>
        {remove ? (
          <span>Are you sure want to remove chosen users?</span>
        ) : (
          <Formik
            initialValues={{ selected: [] as SelectUser[] }}
            innerRef={refFormik}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            <FastField
              name="selected"
              component={SelectField}
              placeholder="Select user"
              searchPlaceholder="Search user ID"
              options={unWhitelisted}
              isMulti
              showSearchBar
            />
          </Formik>
        )}
      </div>

      <div className={cx('dialog-actions')}>
        <CButton
          onClick={handleCloseBulkAction}
          size="md"
          type="secondary"
          isDisabled={isLoading}
          content="Cancel"
        ></CButton>

        <CButton
          isLoading={isLoading}
          onClick={() => (remove ? handleSubmit() : refFormik.current?.handleSubmit())}
          size="md"
          type={remove ? 'error' : 'success'}
          content={remove ? 'Remove user' : 'Add user'}
          isDisabled={remove && !isSelectUser()}
        ></CButton>
      </div>

      <WarningPopup open={openWarningPopup} handleClose={() => setOpenWarningPopup(!openWarningPopup)} />
    </Dialog>
  );
};

export default BulkActionPopup;
