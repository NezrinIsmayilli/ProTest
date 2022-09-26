import { messages } from 'utils';

export const requiredRule = {
    required: true,
    message: messages.requiredText,
};

export const dinamicMaxLengthRule = number => ({
    max: number,
    message: messages.maxtextLimitMessage(number),
});

export const dinamicMinLengthRule = number => ({
    min: number,
    message: messages.mintextLimitMessage(number),
});

export const minLengthRule = {
    min: 3,
    message: messages.mintextLimitMessage(3),
};

export const shortTextMaxRule = {
    max: 30,
    message: messages.maxtextLimitMessage(30),
};
export const documentTextMaxRule = {
    max: 40,
    message: messages.maxtextLimitMessage(40),
};
export const mediumTextMaxRule = {
    max: 60,
    message: messages.maxtextLimitMessage(60),
};
export const longTextMaxRule = {
    max: 120,
    message: messages.maxtextLimitMessage(120),
};
export const bigTextMaxRule = {
    max: 200,
    message: messages.maxtextLimitMessage(200),
};

export const maxNumberRule = {
    type: 'number',
    max: 1000000000.9999,
    message: messages.numberFormat,
};

export const emailRule = {
    type: 'email',
    message: messages.emailFormat,
};
export const numberRule = {
    type: 'number',
    min: 0,
    max: 1000000,
    message: messages.numberFormat,
};

export const percentageRule = {
    type: 'number',
    min: 0,
    max: 100,
    message: messages.percentageFormat,
};
export const urlRule = {
    type: 'url',
    message: messages.urlFormat,
    transform: value => (value ? `https://${value}` : value),
};

export const baseRules = [requiredRule, minLengthRule, shortTextMaxRule];
