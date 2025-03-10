import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { CorneredContainer } from '../../components/common';
import { Button, Link, DropDown, Loader } from '../../basicComponents';
import { eventsService } from '../../infra/eventsService';
import { AppThDispatch, RootState } from '../../types';
import { smColors } from '../../vars';
import { setUiError } from '../../redux/ui/actions';
import { getNetworkDefinitions } from '../../redux/network/actions';
import { AuthRouterParams } from './routerParams';
import Steps, { Step } from './Steps';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;

const DropDownLink = styled.a`
  color: ${smColors.blue};
  cursor: pointer;
`;

const RowColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const BottomPart = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const AccItem = styled.div<{ isInDropDown: boolean }>`
  width: 100%;
  padding: 5px;
  line-height: 17px;
  font-size: 13px;
  text-transform: uppercase;
  color: ${smColors.black};
  cursor: inherit;
  ${({ isInDropDown }) => isInDropDown && `opacity: 0.5; border-bottom: 1px solid ${smColors.disabledGray};`}
  &:hover {
    opacity: 1;
    color: ${smColors.darkGray50Alpha};
  }
`;

const SwitchNetwork = ({ history, location }: AuthRouterParams) => {
  const dispatch: AppThDispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode);
  const ddStyle = { border: `1px solid ${isDarkMode ? smColors.black : smColors.white}`, marginLeft: 'auto' };

  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [networks, setNetworks] = useState({ loading: true, networks: [] as { netId: number; netName: string; explorer?: string }[] });
  const [showLoader, setLoader] = useState(false);

  useEffect(() => {
    eventsService
      .listNetworks()
      .then((nets) =>
        setNetworks({
          loading: false,
          networks: nets,
        })
      )
      .catch((err) => console.error(err)); // eslint-disable-line no-console
  }, []);

  const navigateToExplanation = () => window.open('https://testnet.spacemesh.io/#/guide/setup');

  const selectItem = ({ index }) => setSelectedItemIndex(index);

  const openExplorer = (explorer: string) => {
    window.open(explorer.concat(isDarkMode ? '?dark' : ''), '_blank');
  };

  const renderAccElement = ({ label, explorer, netId, isMain }: { label: string; explorer: string; netId: number; isMain: boolean }) => (
    <AccItem key={label} isInDropDown={!isMain}>
      {netId > 0 ? (
        <>
          {label}
          (ID&nbsp;
          <DropDownLink onClick={() => openExplorer(explorer)} target="_blank">
            {netId}
          </DropDownLink>
          )
        </>
      ) : (
        label
      )}
    </AccItem>
  );

  const getDropDownData = () =>
    networks.loading
      ? [{ label: 'LOADING... PLEASE WAIT', netId: -1, isDisabled: true }]
      : networks.networks.map(({ netId, netName, explorer }) => ({ label: netName, netId, explorer }));

  const handleNext = () => {
    const { netId } = networks.networks[selectedItemIndex];
    setLoader(true);
    const { creatingWallet, isWalletOnly } = location.state;
    return eventsService
      .switchNetwork(netId)
      .then(() => dispatch(getNetworkDefinitions()))
      .then(() =>
        isWalletOnly
          ? history.push('/auth/connect-to-api', { redirect: location.state.redirect, switchApiProvider: true })
          : history.push(location.state.redirect || '/auth/unlock', { creatingWallet, netId })
      )
      .catch((err) => {
        console.error(err); // eslint-disable-line no-console
        dispatch(setUiError(err));
      });
  };

  return showLoader ? (
    <Loader size={Loader.sizes.BIG} isDarkMode={isDarkMode} note="Please wait, connecting to Spacemesh network..." />
  ) : (
    <Wrapper>
      {!!location.state.creatingWallet && <Steps step={Step.SELECT_NETWORK} isDarkMode={isDarkMode} />}
      <CorneredContainer
        width={650}
        height={400}
        header="SPACEMESH NETWORK"
        subHeader="Select a public Spacemesh network for your wallet."
        tooltipMessage="test"
        isDarkMode={isDarkMode}
      >
        {/* NETWORKS: {location.state} */}
        <RowColumn>
          <DropDown
            data={getDropDownData()}
            onClick={selectItem}
            DdElement={renderAccElement}
            selectedItemIndex={selectedItemIndex}
            rowHeight={40}
            style={ddStyle}
            bgColor={smColors.white}
          />
        </RowColumn>

        <BottomPart>
          <Link onClick={navigateToExplanation} text="WALLET SETUP GUIDE" />
          <Button onClick={handleNext} text="NEXT" />
        </BottomPart>
      </CorneredContainer>
    </Wrapper>
  );
};

export default SwitchNetwork;
