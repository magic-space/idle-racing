import React, { useContext, useEffect, useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/core';
import { Link } from 'react-router-dom';
import { Link as ChakraLink } from '@chakra-ui/core';
import { colors } from '../helpers/theme';
import { useDynamicCardContainerWidth } from '../helpers/hooks';
import { useRequirements } from '../helpers/hooksRace';
import CardCarSmallRace from './CardCarSmallRace';
import { RaceContext } from '../helpers/context';
import styled from '@emotion/styled';

const RequirementText = styled(Text)`
  animation: ${({ blink }) =>
    blink ? 'fails-requirement 0.5s ease 3' : 'none'};

  :hover {
    animation: none;
  }

  @keyframes fails-requirement {
    50% {
      background-color: ${colors.red};
    }
    100% {
      background-color: inherit;
    }
  }
`;

const RaceDetailsCarsContainer = ({ cars, selectCar, onClose, ...props }) => {
  const containerWidth = useDynamicCardContainerWidth();
  const { requirements } = useContext(RaceContext);
  const { requirementText } = useRequirements();
  const [
    failedRequirementsAnimation,
    setFailedRequirementsAnimation,
  ] = useState(new Array(requirements.length));

  useEffect(() => {
    const escapeClose = event => {
      if (event.keyCode === 27) {
        onClose();
      }
    };

    document.addEventListener('keydown', escapeClose, false);

    return () => {
      document.removeEventListener('keydown', escapeClose, false);
    };
  }, [onClose]);

  const onClickChild = e => {
    e.stopPropagation();
  };

  const failedRequirements = failRequirementsValue => {
    setFailedRequirementsAnimation({
      ...failedRequirementsAnimation,
      ...failRequirementsValue,
    });
  };

  return (
    <Flex borderRadius="16px" overflowX="hidden" onClick={onClose}>
      <Box
        w={`${containerWidth + 16}px`}
        borderRadius="16px"
        bg={colors.white}
        margin="auto"
        onClick={onClickChild}
      >
        {requirements.length > 0 && (
          <Flex justifyContent="space-around" flexWrap="wrap">
            {requirements.map((requirement, index) => (
              <RequirementText
                margin="4px"
                minW="160px"
                textAlign="center"
                padding="0 4px"
                border={`2px solid ${colors.darkGray}`}
                key={requirementText(requirement)}
                blink={failedRequirementsAnimation[index]}
                onAnimationEnd={() =>
                  setFailedRequirementsAnimation({
                    ...failedRequirementsAnimation,
                    [index]: undefined,
                  })
                }
              >
                {requirementText(requirement)}
              </RequirementText>
            ))}
          </Flex>
        )}
        <Flex
          w={`${containerWidth}px`}
          minH="240px"
          wrap="wrap"
          margin="0 auto"
          paddingTop="16px"
          paddingLeft="16px"
          boxSizing="content-box"
          {...props}
        >
          {cars.length === 0 && (
            <Flex margin="auto" direction="column">
              <Text textAlign="center" fontSize="24px">
                Du benötigst erst ein Auto
              </Text>
              <ChakraLink
                as={Link}
                to="/dealer"
                color="teal.500"
                margin="8px auto 0"
              >
                gehe zum Händler 
              </ChakraLink>
            </Flex>
          )}
          {cars.map(car => (
            <Box marginRight="16px" marginBottom="16px" key={car.id}>
              <CardCarSmallRace
                car={car}
                onClick={selectCar}
                failedRequirements={failedRequirements}
              />
            </Box>
          ))}
        </Flex>
      </Box>
    </Flex>
  );
};

export default RaceDetailsCarsContainer;
