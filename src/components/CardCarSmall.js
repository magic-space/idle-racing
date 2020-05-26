import React, { useState, useEffect } from 'react';
import { Box, Text, Flex, Image } from '@chakra-ui/core';
import { useLocation, useHistory } from 'react-router-dom';
import CardProgressOverlay from './CardProgressOverlay';
import {
  raceSelector,
  tracksSelector,
  garageCarsSelector,
} from '../state/selectors';
import { useSelector } from 'react-redux';
import CardWinningChance from './CardWinningChance';
import styled from '@emotion/styled';
import {
  doMeetRequirements,
  capitalize,
  ATTRIBUTE_TYPES,
} from '../helpers/utils';
import { colors } from '../helpers/theme';
import { getImage } from '../helpers/imageMapping';
import AttributeCircle from './AttributeCircle';

const BoughtAnimation = styled(Flex)`
  animation: fadeOut ease 1.5s;
  opacity: 0;

  @keyframes fadeOut {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;

const CardCarSmall = ({
  car,
  stripped,
  onClick,
  showPrice,
  garage,
  ...props
}) => {
  const { id, race } = car;
  const location = useLocation();
  const history = useHistory();
  const tracks = useSelector(tracksSelector);
  const garageCars = useSelector(garageCarsSelector);
  const selectedTrackId = location?.state?.track;
  const selectedTrack = tracks.find(item => item.id === selectedTrackId);
  const [bought, setBought] = useState();

  const currentRace = useSelector(raceSelector(race));

  const meetsRequirements = doMeetRequirements(
    car,
    selectedTrack?.requirements
  );

  useEffect(() => {
    const currentTime = new Date().getTime();

    garageCars.forEach(element => {
      if (
        element.dealerCar === car.id &&
        currentTime - element.timestamp <= 1000
      ) {
        setBought(true);
      }
    });
  }, [garageCars, car.id, car.timestamp]);

  // To improve mobile navigation,
  // this way the back button will un-select instead off showing the previous selected
  const setSelected = () => {
    if (!meetsRequirements) return;

    if (onClick) {
      onClick(car);

      return;
    }

    if (currentRace) return;

    if (location?.state?.car) {
      history.replace({
        pathname: location.pathname,
        state: { ...(location.state || {}), car: id },
      });
    } else {
      history.push({
        pathname: location.pathname,
        state: { ...(location.state || {}), car: id },
      });
    }
  };

  const color = garage ? colors.lightBlue : colors.orange;

  return (
    <Box
      w="160px"
      h={garage ? '180px' : '124px'}
      position="relative"
      onClick={setSelected}
      cursor={meetsRequirements ? 'pointer' : 'unset'}
      borderRadius="16px"
      boxShadow="0px 4px 4px rgba(0, 0, 0, 0.25)"
      {...props}
    >
      <Box w="100%" h="100px" position="absolute">
        {/* {location?.state?.car === id && (
          <Box
            position="absolute"
            w="100%"
            h="100%"
            borderRadius="16px"
            bg="#B2F5EA77"
          />
        )} */}

        {!meetsRequirements && (
          <Flex
            position="absolute"
            w="100%"
            h="100%"
            bg="blackAlpha.800"
            flexDirection="column"
            borderRadius="16px"
          >
            <Text
              fontSize="24px"
              textAlign="center"
              margin="auto"
              color="white"
            >
              Don't meet the requirements
            </Text>
          </Flex>
        )}
        {/* <CardCarSmallContent
          padding="0 16px"
          bg="white"
          {...(!stripped && {
            border: '1px solid black',
            borderRadius: '16px',
          })}
          car={car}
        /> */}
      </Box>
      {selectedTrack && (
        <CardWinningChance
          car={car}
          track={selectedTrack}
          meetsRequirements={meetsRequirements}
          w="100%"
          h="124px"
          borderRadius="16px"
          border="1px solid black"
        />
      )}
      <Flex w="100%" h="100%" direction="column" borderRadius="16px" bg={color}>
        <Text
          fontSize="14px"
          lineHeight="24px"
          textAlign="center"
          w="100%"
          marginTop="100px"
        >
          {car.name}
        </Text>
        {garage && (
          <Flex justifyContent="space-evenly">
            <AttributeCircle
              attr={car[ATTRIBUTE_TYPES.ACCELERATION]}
              text="ACC"
            />
            <AttributeCircle attr={car[ATTRIBUTE_TYPES.TOP_SPEED]} text="TSP" />
            <AttributeCircle attr={car[ATTRIBUTE_TYPES.HANDLING]} text="HND" />
          </Flex>
        )}
      </Flex>
      <Box
        w="100%"
        h="100px"
        position="absolute"
        top="0"
        left="0"
        borderRadius="16px"
        color={colors.darkGray}
        fontSize="12px"
        lineHeight="12px"
      >
        <Image
          w="100%"
          h="100px"
          alt="car"
          borderRadius="16px"
          border={`1px solid ${color}`}
          objectFit="contain"
          bg={colors.white}
          src={getImage(car)}
        />
        <Text top="8px" left="8px" position="absolute">
          {capitalize(car.brand)}
        </Text>
        <Text bottom="8px" right="8px" position="absolute">
          {car.type}
        </Text>
      </Box>
      {bought && (
        <BoughtAnimation
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          bg={colors.green}
          borderRadius="16px"
        >
          <Text fontSize="24px" margin="auto">
            Bought
          </Text>
        </BoughtAnimation>
      )}
      {currentRace && (
        <CardProgressOverlay
          race={currentRace}
          car={car}
          label
          borderRadius="16px"
        />
      )}
      {/* {showPrice && (
        <Flex w="100%" h="124px" borderRadius="16px" bg="black">
          <Text
            fontSize="14px"
            lineHeight="24px"
            textAlign="center"
            w="100%"
            marginTop="auto"
            color={money < price ? 'tomato' : 'white'}
          >
            {reward ? 'Reward' : `$${price}`}
          </Text>
        </Flex>
      )} */}
    </Box>
  );
};

export default CardCarSmall;
