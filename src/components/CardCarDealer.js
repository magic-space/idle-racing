import React, { useState, useEffect } from 'react';
import { Text, Flex } from '@chakra-ui/core';
import {
  garageCarsSelector,
  boughtCarsSelector,
  enoughMoneySelector,
} from '../state/selectors';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { colors } from '../helpers/theme';
import CardCarSmall from './CardCarSmall';
import { formatMoney } from '../helpers/utils';

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

const CardCarDealer = ({ car, ...props }) => {
  const { id, price } = car;
  const garageCars = useSelector(garageCarsSelector);
  const boughtCars = useSelector(boughtCarsSelector);
  const enoughMoney = useSelector(enoughMoneySelector(price));
  const [bought, setBought] = useState();

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

  return (
    <CardCarSmall
      w="160px"
      h="148px"
      bg={colors.darkGray}
      infoBgColor={boughtCars[id] ? colors.orange : colors.lightGray}
      infoH="124px"
      car={car}
      {...props}
    >
      <Text
        fontSize="14px"
        lineHeight="24px"
        textAlign="center"
        w="100%"
        marginTop="auto"
        color={!enoughMoney && !car.reward ? colors.red : colors.white}
      >
        {car.reward ? 'Reward' : `$${formatMoney(car.price)}`}
      </Text>
      {bought && (
        <BoughtAnimation
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          bg={colors.green}
          borderRadius="16px"
          zIndex="1"
        >
          <Text fontSize="24px" margin="auto">
            Bought
          </Text>
        </BoughtAnimation>
      )}
    </CardCarSmall>
  );
};

export default CardCarDealer;
