import React from 'react';
import { Text, Flex } from '@chakra-ui/core';
import { colors } from '../helpers/theme';
import Modal from './Modal';
import Button from './Button';
import { useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { stopRaceAction } from '../state/actions';
import { raceSelector } from '../state/selectors';

const StopRaceModal = props => {
  const location = useLocation();
  const history = useHistory();
  const raceId = location.state?.cancelRaceModal;
  const race = useSelector(raceSelector(raceId));
  const dispatch = useDispatch();

  const stopRace = () => {
    dispatch(stopRaceAction(raceId));
  };

  const onClose = () => {
    history.goBack();
  };

  return (
    <Modal isOpen={race} onClose={onClose}>
      <Flex
        direction="column"
        bg={colors.white}
        margin="32px"
        padding="24px"
        borderRadius="16px"
        {...props}
      >
        <Text textAlign="center" fontSize="16px">
          Stop auto race
        </Text>
        <Flex marginTop="16px">
          <Button
            onClick={stopRace}
            minW="72px"
            h="24px"
            fontSize="12px"
            bg={colors.darkGray}
            color={colors.white}
          >
            Yes
          </Button>
          <Button
            onClick={onClose}
            minW="72px"
            h="24px"
            fontSize="12px"
            color={colors.darkGray}
            bg={colors.lightGray}
            marginLeft="16px"
          >
            Cancel
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default StopRaceModal;