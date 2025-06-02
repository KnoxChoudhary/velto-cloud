import { InlineKeyboardButton } from '../../types/telegram';

export const createInlineKeyboard = (buttons: InlineKeyboardButton[][]): { inline_keyboard: InlineKeyboardButton[][] } => {
  return {
    inline_keyboard: buttons,
  };
};

export const createSingleButtonKeyboard = (text: string, callbackData: string): { inline_keyboard: InlineKeyboardButton[][] } => {
  return createInlineKeyboard([
    [{ text, callback_data: callbackData }],
  ]);
};

export const createUrlButtonKeyboard = (text: string, url: string): { inline_keyboard: InlineKeyboardButton[][] } => {
  return createInlineKeyboard([
    [{ text, url }],
  ]);
};
