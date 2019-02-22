import {BotMessages} from './types';
import * as normal from './normal';


// tslint:disable:max-line-length
export function getMessages(): BotMessages {
    return {
        ...normal.getMessages(),
    HELLO_MESSAGE:
    'Привет от бота Гдесрача: анонимного, небрезгливого, твоего! Анонимус, скорее жми /sendarticle чтобы чтобы поделиться свежим срачем!',
    SEND_ARTICLE_NOW: 
    'Кидай ссылку на срач! Даже Недорогая не будет знать твоего имени, Анонимус. Если у тебя есть горячие скриншоты — можешь выложить их в скрытый альбом вконтакте (эти ссылки не связаны с пользователем) или в любое другое место и дать прямую ссылку, картинки бот режет.',
    ARTICLE_WAITING_FOR_APPROVAL:
    'Наброс готов! Жми /yes чтобы подтвердить отправку или /no чтобы отменить и попробовать набросить лучше.',
    NEED_SEND_ARTICLE_CMD:
    'Чтоб набросить, сначала нажми /sendarticle.',
    NEED_ARTICLE_TEXT:
    'Сначала расскажи, где срач!',
    THANK_YOU_FOR_ARTICLE:
    'Готово! Наброс отправлен в недорогую редакцию. Спасибо за труд, Анонимус!',
    ARTICLE_SEND_WAS_CANCELLED: 
    'Ты можешь лучше! Жми /sendarticle чтобы отправить другой наброс.',
    ARTICLE_REQUEST_APPROVAL:
    'Почти готово! Жми /yes чтобы подтвердить отправку или /no чтобы отменить отправку наброса и отправить другой.' +
    'Если нужно - можно отредактировать наброс до нажатия /yes.'
    };
}