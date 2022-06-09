import { Location } from 'history';
import React from 'react';
import { Prompt } from 'react-router-dom';
import WarningPopup from 'src/features/Pools/component/PoolDetail/Settings/LiquidityProvidersSetting/WarningPopup';
interface Props {
  when?: boolean | undefined;
  navigate: (path: string) => void;
  shouldBlockNavigation: (location: Location) => boolean;
}
const LeavePageWarning: React.FC<Props> = ({ when, navigate, shouldBlockNavigation }) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [lastLocation, setLastLocation] = React.useState<Location | null>(null);
  const [confirmedNavigation, setConfirmedNavigation] = React.useState(false);

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleBlockedNavigation = (nextLocation: Location): boolean => {
    if (!confirmedNavigation && shouldBlockNavigation(nextLocation)) {
      setModalVisible(true);
      setLastLocation(nextLocation);
      return false;
    }
    return true;
  };

  const handleConfirmNavigationClick = () => {
    setModalVisible(false);
    setConfirmedNavigation(true);
  };

  React.useEffect(() => {
    if (confirmedNavigation && lastLocation) {
      // Navigate to the previous blocked location with your navigate function
      navigate(lastLocation.pathname);
    }
  }, [confirmedNavigation, lastLocation]);

  return (
    <>
      <Prompt when={when} message={handleBlockedNavigation} />
      {/* Your own alert/dialog/modal component */}
      <WarningPopup
        leave
        open={modalVisible}
        handleClose={closeModal}
        handleConfirmLeave={handleConfirmNavigationClick}
      />
    </>
  );
};
export default LeavePageWarning;
