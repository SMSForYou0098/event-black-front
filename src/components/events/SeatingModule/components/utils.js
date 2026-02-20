import { renderToStaticMarkup } from 'react-dom/server';
import { FaChair } from 'react-icons/fa';
import { MdOutlineChair, MdOutlineTableBar } from 'react-icons/md';
import { PiArmchairLight, PiChair, PiOfficeChair } from 'react-icons/pi';
import { LuSofa } from 'react-icons/lu';
import { TbSofa } from 'react-icons/tb';
import { GiRoundTable } from 'react-icons/gi';
import { SiTablecheck } from 'react-icons/si';
import { SEAT_COLORS } from './constants';

const iconImageCache = new Map();
const iconLoadingPromises = new Map();

export const ICON_MAP = {
    'FaChair': FaChair,
    'MdOutlineChair': MdOutlineChair,
    'PiArmchairLight': PiArmchairLight,
    'PiChair': PiChair,
    'PiOfficeChair': PiOfficeChair,
    'LuSofa': LuSofa,
    'TbSofa': TbSofa,
    'GiRoundTable': GiRoundTable,
    'SiTablecheck': SiTablecheck,
    'MdOutlineTableBar': MdOutlineTableBar
};

export const createIconImage = (iconName, size, color = '#FFFFFF') => {
    const cacheKey = `${iconName}-${size}-${color}`;

    if (iconImageCache.has(cacheKey)) {
        return Promise.resolve(iconImageCache.get(cacheKey));
    }

    if (iconLoadingPromises.has(cacheKey)) {
        return iconLoadingPromises.get(cacheKey);
    }

    const promise = new Promise((resolve) => {
        try {
            const IconComponent = ICON_MAP[iconName];

            if (!IconComponent) {
                const DefaultIcon = ICON_MAP['FaChair'];
                const svgString = renderToStaticMarkup(
                    <DefaultIcon size={size} color={color} />
                );

                const img = new window.Image();
                img.onload = () => {
                    iconImageCache.set(cacheKey, img);
                    iconLoadingPromises.delete(cacheKey);
                    resolve(img);
                };
                img.onerror = () => {
                    iconLoadingPromises.delete(cacheKey);
                    resolve(null);
                };
                img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
                return;
            }

            const svgString = renderToStaticMarkup(
                <IconComponent size={size} color={color} />
            );

            const img = new window.Image();
            img.onload = () => {
                iconImageCache.set(cacheKey, img);
                iconLoadingPromises.delete(cacheKey);
                resolve(img);
            };
            img.onerror = () => {
                iconLoadingPromises.delete(cacheKey);
                resolve(null);
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
        } catch (error) {
            console.error('Error creating icon image:', error);
            iconLoadingPromises.delete(cacheKey);
            resolve(null);
        }
    });

    iconLoadingPromises.set(cacheKey, promise);
    return promise;
};

export const getSeatColor = (seat, isSelected) => {
    if (!seat.ticket) return SEAT_COLORS.noTicket;
    if (seat.status === 'booked') return SEAT_COLORS.booked;
    if (seat.status === 'hold' || seat.status === 'locked') return SEAT_COLORS.hold;
    if (seat.status === 'disabled') return SEAT_COLORS.disabled;
    if (isSelected || seat.status === 'selected') return SEAT_COLORS.selected;
    return SEAT_COLORS.available;
};

export const getLayoutBounds = (stage, sections) => {
    if (!stage || !sections || sections.length === 0) {
        return { minX: 0, minY: 0, maxX: 1000, maxY: 600, width: 1000, height: 600 };
    }

    let minX = stage.x;
    let minY = stage.y;
    let maxX = stage.x + stage.width;
    let maxY = stage.y + stage.height;

    sections.forEach(section => {
        minX = Math.min(minX, section.x);
        minY = Math.min(minY, section.y);
        maxX = Math.max(maxX, section.x + section.width);
        maxY = Math.max(maxY, section.y + section.height);
    });

    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY
    };
};

export const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const getCenter = (p1, p2) => {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
    };
};
