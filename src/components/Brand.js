import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/core';
import { useLocation, useParams } from 'react-router-dom';
import CarDetailsDealer from './CarDetailsDealer';
import { useSelector } from 'react-redux';
import { dealerCarsSelector } from '../state/selectors';
import Modal from './Modal';
import CardCarDealer from './CardCarDealer';
import { useDynamicCardContainerWidth } from '../helpers/hooks';
import { BottomSpacer } from './BottomSpacer';
import { colors } from '../helpers/theme';
import { capitalize } from '../helpers/utils';
import { brandSponsors } from '../helpers/sponsors';
import { useCarsAcquired } from '../helpers/hooksDealer';

const CarsContainer = ({ cars, ...props }) => (
  <Flex
    wrap="wrap"
    margin="0 auto"
    paddingLeft="16px"
    boxSizing="content-box"
    {...props}
  >
    {cars.map(car => (
      <Box marginRight="16px" marginBottom="16px" key={car.id}>
        <CardCarDealer car={car} />
      </Box>
    ))}
  </Flex>
);

const Brand = () => {
  const location = useLocation();
  const { brand } = useParams();

  const cars = useSelector(dealerCarsSelector).filter(
    item => item.brand === brand
  );

  const carsAcquired = useCarsAcquired(cars);
  const allCarsAcquired = carsAcquired === cars.length;

  const containerWidth = useDynamicCardContainerWidth();

  const selected = location?.state?.car;

  const selectedCar = cars.find(item => item.id === selected);

  const brandSponsor = ~~brandSponsors[brand];

  const primaryBg =
    (allCarsAcquired && colors.orange) ||
    (carsAcquired > 0 && colors.darkGray) ||
    colors.lightGray;

  const primaryColor =
    (allCarsAcquired && 'black') ||
    (carsAcquired > 0 && colors.white) ||
    'black';

  return (
    <Box>
      <Modal isOpen={!!selectedCar} backOnClose>
        {selectedCar && <CarDetailsDealer car={selectedCar} />}
      </Modal>

      {cars.length === 0 && (
        <Text marginTop="16px" textAlign="center" fontSize="24px">
          Diese Marke existiert nicht
        </Text>
      )}

      {brandSponsor > 0 && (
        <Flex
          w={`${containerWidth - 16}px`}
          minH="32px"
          borderRadius="8px"
          marginLeft="16px"
          border={`2px solid ${colors.darkGray}`}
          color={primaryColor}
          bg={primaryBg}
          padding="8px"
        >
          {!allCarsAcquired && (
            <Text margin="auto" textAlign="center">
              Acquire all "{capitalize(brand)}" Autos, um Markensponsor freizuschalten (
              {`${carsAcquired}/${cars.length} cars`})
            </Text>
          )}
          {allCarsAcquired && (
            <Text margin="auto" textAlign="center">
              "{capitalize(brand)}" cars brand sponsor ({`$${brandSponsor}/s`})
            </Text>
          )}
        </Flex>
      )}

      <CarsContainer w={`${containerWidth}px`} marginTop="24px" cars={cars} />

      <BottomSpacer />
    </Box>
  );
};

export default Brand;
