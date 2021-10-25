import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { eventsService } from '../../infra/eventsService';
import { getCurrentLayer } from '../../redux/network/actions';
import { NetworkStatus } from '../../components/NetworkStatus';
import { WrapperWith2SideBars, Link, Tooltip, CustomTimeAgo, Button } from '../../basicComponents';
import { smColors } from '../../vars';
import { network } from '../../assets/images';
import { RootState } from '../../types';
import ErrorMessage from '../../basicComponents/ErrorMessage';
import SubHeader from '../../basicComponents/SubHeader';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  flex: 1;
`;

const DetailsWrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterWrap = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
`;

const DetailsRow = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: ${({ theme }) => `1px solid ${theme.isDarkMode ? smColors.white : smColors.darkGray10Alpha};`};
  &:last-child {
    border-bottom-color: transparent;
  }
`;

const DetailsText = styled.div`
  font-size: 16px;
  line-height: 20px;
  margin: 10px 0;
  color: ${({ theme }) => (theme.isDarkMode ? smColors.white : smColors.realBlack)};
`;

const GrayText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 14px;
  text-transform: uppercase;
  color: ${({ theme }) => (theme.isDarkMode ? smColors.white : smColors.dark75Alpha)};
`;

const DetailsTextWrap = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Network = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const asyncGetCurrentLayer = async () => {
      await dispatch(getCurrentLayer());
    };
    asyncGetCurrentLayer();
  }, [dispatch]);

  const isWalletOnly = useSelector((state: RootState) => state.wallet.meta.isWalletOnly);
  const status = useSelector((state: RootState) => state.node.status);
  const nodeError = useSelector((state: RootState) => state.node.error);
  const netName = useSelector((state: RootState) => state.network.netName || 'UNKNOWN NETWORK NAME');
  const genesisTime = useSelector((state: RootState) => state.network.genesisTime);
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode);
  const [isRestarting, setRestarting] = useState(false);

  const requestNodeRestart = useCallback(async () => {
    setRestarting(true);
    await eventsService.restartNode();
    setRestarting(false);
  }, []);

  const openLogFile = () => {
    eventsService.showFileInFolder({ isLogFile: true });
  };

  return (
    <WrapperWith2SideBars width={1000} header="NETWORK" headerIcon={network} isDarkMode={isDarkMode}>
      <SubHeader>
        {netName}
        {nodeError && <ErrorMessage>{nodeError?.msg}</ErrorMessage>}
      </SubHeader>
      <Container>
        <DetailsWrap>
          <DetailsRow>
            <DetailsTextWrap>
              <DetailsText>Age</DetailsText>
              <Tooltip width={250} text="tooltip age" isDarkMode={isDarkMode} />
            </DetailsTextWrap>
            <GrayText>
              <CustomTimeAgo time={genesisTime} />
            </GrayText>
          </DetailsRow>
          {!isWalletOnly && (
            <DetailsRow>
              <DetailsTextWrap>
                <DetailsText>Status</DetailsText>
                <Tooltip width={250} text="tooltip Status" isDarkMode={isDarkMode} />
              </DetailsTextWrap>
              <GrayText>
                <NetworkStatus status={status} error={nodeError} isRestarting={isRestarting} />
              </GrayText>
            </DetailsRow>
          )}
          <DetailsRow>
            <DetailsTextWrap>
              <DetailsText>Current Layer</DetailsText>
              <Tooltip width={250} text="tooltip Current Layer" isDarkMode={isDarkMode} />
            </DetailsTextWrap>
            <GrayText>{status?.topLayer || 0}</GrayText>
          </DetailsRow>
          <DetailsRow>
            <DetailsTextWrap>
              <DetailsText>Verified Layer</DetailsText>
              <Tooltip width={250} text="tooltip Verified Layer" isDarkMode={isDarkMode} />
            </DetailsTextWrap>
            <GrayText>{status?.verifiedLayer || 0}</GrayText>
          </DetailsRow>
          <DetailsRow>
            <DetailsTextWrap>
              <DetailsText>Connection Type</DetailsText>
              <Tooltip width={250} text="tooltip Connection Type" isDarkMode={isDarkMode} />
            </DetailsTextWrap>
            <GrayText>{isWalletOnly ? 'Remote Gateway' : 'Managed p2p node'}</GrayText>
          </DetailsRow>
          {!isWalletOnly && (
            <DetailsRow>
              <DetailsTextWrap>
                <DetailsText>Connected neighbors</DetailsText>
                <Tooltip width={250} text="tooltip Connected neighbors" isDarkMode={isDarkMode} />
              </DetailsTextWrap>
              <GrayText>8</GrayText>
            </DetailsRow>
          )}
        </DetailsWrap>
        <FooterWrap>
          <Link onClick={openLogFile} text="BROWSE LOG FILE" />
          <Tooltip width={250} text="tooltip BROWSE LOG FILE" isDarkMode={isDarkMode} />
          {nodeError && (
            <Button
              text={isRestarting ? 'RESTARTING...' : 'RESTART NODE'}
              width={150}
              isPrimary
              onClick={requestNodeRestart}
              style={{ marginLeft: 'auto' }}
              isDisabled={isRestarting}
            />
          )}
        </FooterWrap>
      </Container>
    </WrapperWith2SideBars>
  );
};

export default Network;
