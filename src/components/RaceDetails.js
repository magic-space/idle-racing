import React, { useState, useEffect } from 'react';
import { Box, Flex, Text } from '@chakra-ui/core';
import CardProgressOverlay from './CardProgressOverlay';
import { useDispatch, useSelector } from 'react-redux';
import { startRaceAction } from '../state/actions';
import RaceResults from './RaceResults';
import { useLocation, Link, useHistory } from 'react-router-dom';
import { Link as ChakraLink } from '@chakra-ui/core';
import {
  raceSelector,
  garageCarsSelector,
  tracksSelector,
  moneySelector,
  pastRaceSelector,
} from '../state/selectors';
import CardTrackContent from './CardTrackContent';
import Modal from './Modal';
import { colors } from '../helpers/theme';
import RaceDetailsSelectCar from './RaceDetailsSelectCar';
import { useOpenClose, useDynamicCardContainerWidth } from '../helpers/hooks';
import RaceDetailsSelectedCar from './RaceDetailsSelectedCar';
import { doMeetRequirements } from '../helpers/utils';
import CardCarSmallRace from './CardCarSmallRace';
import Button from './Button';

const CarsContainer = ({ cars, selectCar, ...props }) => {
  const containerWidth = useDynamicCardContainerWidth();

  return (
    <Box
      maxH="calc(100vh - 2 * 48px - 2 * 32px)"
      overflowY="scroll"
      borderRadius="16px"
    >
      <Flex
        w={`${containerWidth}px`}
        minH="40vh"
        wrap="wrap"
        margin="0 auto"
        paddingTop="16px"
        paddingLeft="16px"
        boxSizing="content-box"
        bg={colors.white}
        {...props}
      >
        {cars.length === 0 && (
          <Flex margin="auto" direction="column">
            <Text textAlign="center" fontSize="24px">
              You need to buy a car first
            </Text>
            <ChakraLink
              as={Link}
              to="/dealer"
              fontSize="12px"
              color="teal.500"
              margin="8px auto 0"
            >
              go to Dealer
            </ChakraLink>
          </Flex>
        )}
        {cars.map(car => (
          <Box marginRight="16px" marginBottom="16px" key={car.id}>
            <CardCarSmallRace car={car} onClick={selectCar} />
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

const ActionContent = ({
  selectedCar,
  selectedTrack,
  carsModalOpen,
  money,
  price,
  currentRace,
  startRace,
  results,
  pastRace,
  meetsRequirements,
  ...props
}) => (
  <Flex h="100%" direction="column" {...props}>
    {results && (
      <RaceResults
        pastRace={pastRace}
        raceAgain={startRace}
        selectCar={carsModalOpen}
      />
    )}
    {!results && !selectedCar && (
      <RaceDetailsSelectCar onClick={carsModalOpen} />
    )}

    {!results && selectedCar && (
      <>
        <RaceDetailsSelectedCar
          car={selectedCar}
          track={selectedTrack}
          carsModalOpen={carsModalOpen}
        />
        <Box margin="auto auto 20px">
          <Button
            w="96px"
            isDisabled={money < price || currentRace || !meetsRequirements}
            bg={colors.white}
            color={colors.darkGray}
            _hover={{
              bg: colors.blue,
              color: colors.white,
            }}
            onClick={startRace}
          >
            Race
          </Button>
        </Box>
      </>
    )}
  </Flex>
);

const RaceDetails = ({ track: { price, race } }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const money = useSelector(moneySelector);
  const cars = useSelector(garageCarsSelector);
  const tracks = useSelector(tracksSelector);
  const selectedTrackId = location?.state?.track;
  const selectedTrack = tracks.find(item => item.id === selectedTrackId);
  const [selectedCar, setSelectedCar] = useState();

  const pastRace = useSelector(pastRaceSelector(selectedTrack.lastRace));
  const results = !!pastRace && pastRace.checked === false;

  useEffect(() => {
    if (results && pastRace) {
      setSelectedCar(cars.find(car => car.id === pastRace.car));
    }
  }, [results, pastRace, cars]);

  const currentRace = useSelector(raceSelector(race));

  const [carsModal, carsModalOpen, carsModalClose] = useOpenClose();

  const meetsRequirements =
    selectedCar && doMeetRequirements(selectedCar, selectedTrack?.requirements);

  const startRace = id => {
    if (!meetsRequirements) {
      return;
    }

    dispatch(startRaceAction(selectedCar.id, selectedTrackId));
    history.goBack();
  };

  const selectCar = car => {
    setSelectedCar(car);
    carsModalClose();
  };

  return (
    <Box
      position="relative"
      w="320px"
      h="180px"
      overflowY={['scroll', 'scroll', 'unset']}
      bg={colors.darkGray}
      borderRadius="16px"
    >
      {currentRace && (
        <CardProgressOverlay
          zIndex="1"
          race={currentRace}
          borderRadius="16px"
        />
      )}

      <Modal isOpen={carsModal} onClose={carsModalClose}>
        <CarsContainer cars={cars} selectCar={selectCar} />
      </Modal>

      <Flex direction="row">
        <CardTrackContent
          w="50%"
          track={selectedTrack}
          borderRadius="16px 0 0 16px"
        />
        <Box w="50%" position="relative">
          <ActionContent
            selectedCar={selectedCar}
            selectedTrack={selectedTrack}
            carsModalOpen={carsModalOpen}
            money={money}
            price={price}
            currentRace={currentRace}
            startRace={startRace}
            results={results}
            pastRace={pastRace}
            meetsRequirements={meetsRequirements}
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default RaceDetails;
