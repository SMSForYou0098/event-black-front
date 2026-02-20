import React, { memo } from 'react';
import { Group, Text, Line, Path } from 'react-konva';
import { THEME } from './constants';

const StageScreen = memo(({ stage }) => {
    if (!stage) return null;

    const isStraight = stage.shape === 'straight';
    const curveIntensity = stage.curve || 0.12;
    const curveHeight = isStraight ? 0 : stage.width * curveIntensity;

    return (
        <Group x={stage.x} y={stage.y}>
            {isStraight ? (
                <Line
                    points={[0, 0, stage.width, 0]}
                    stroke={THEME.primary}
                    strokeWidth={3}
                    lineCap="round"
                    listening={false}
                    perfectDrawEnabled={false}
                    shadowColor={THEME.primary}
                    shadowBlur={12}
                    shadowOpacity={0.7}
                />
            ) : (
                <Path
                    data={`
                        M 0 ${curveHeight}
                        Q ${stage.width / 2} 0 ${stage.width} ${curveHeight}
                    `}
                    stroke={THEME.primary}
                    strokeWidth={3}
                    fill="transparent"
                    lineCap="round"
                    listening={false}
                    perfectDrawEnabled={false}
                    shadowColor={THEME.primary}
                    shadowBlur={12}
                    shadowOpacity={0.7}
                />
            )}

            <Text
                width={stage.width}
                y={curveHeight + 15}
                text={stage.name || 'SCREEN'}
                fontSize={14}
                fill={THEME.textSecondary}
                fontStyle="500"
                align="center"
                letterSpacing={4}
                listening={false}
                perfectDrawEnabled={false}
            />
        </Group>
    );
});

StageScreen.displayName = 'StageScreen';

export default StageScreen;
