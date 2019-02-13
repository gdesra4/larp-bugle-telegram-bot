import Datastore from '@google-cloud/datastore'
import * as dotenv from 'dotenv';
dotenv.load();

// See https://github.com/yagop/node-telegram-bot-api/issues/319
process.env.NTBA_FIX_319 = "X"
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string);
bot.setWebHook('https://europe-west1-alice-larp.cloudfunctions.net/larp-bugle-telegram-bot');

const kModeratorChatId = -346184941;

const gDatastore = new Datastore();
const kDatastoreKind = 'MessageVotes';

class MessageVotes {
  public votesFor: number[] = [];
  public votesAgainst: number[] = [];
}

exports.cloudFn = (req: any, res: any) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
};

async function saveDatastoreEntry(messageId: string, votes: MessageVotes) {
  const task = {
    key: gDatastore.key([kDatastoreKind, messageId]),
    data: votes
  };

  try {
    await gDatastore.save(task);
    console.log(`Saved ${task.key.name}`);
  } catch (err) {
    console.error('ERROR:', err);
  }
}

async function readDatastoreEntry(messageId: string): Promise<MessageVotes> {
  const queryResult = await gDatastore.get(gDatastore.key([kDatastoreKind, messageId]));
  console.log(`Query result: ${JSON.stringify(queryResult)}`);
  return queryResult[0] as MessageVotes;
}

function createVoteMarkup(votes: MessageVotes): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [[
      {
        text: `👍 (${votes.votesFor.length})`,
        callback_data: '+',
      },
      {
        text: `👎 (${votes.votesAgainst.length})`,
        callback_data: '-',
      },
    ]],
  }
}

// Matches "/vote [whatever]"
bot.onText(/^\/ping(.+)/, async (msg, _match) => {
  const chatId = msg.chat.id;
  const res = await bot.sendMessage(chatId, 'Pong!');
  console.log(JSON.stringify(res));
});

// Any text...
bot.onText(/^(.+)/, async (msg) => {
  console.log(`Received message: ${JSON.stringify(msg)}`);
  // ... which is sent privately
  if (msg.chat && msg.chat.type == 'private' && msg.text) {
    const votes = new MessageVotes();
    const res = await bot.sendMessage(kModeratorChatId, msg.text, { reply_markup: createVoteMarkup(votes) });
    await saveDatastoreEntry(`${res.chat.id}_${res.message_id}`, votes);
    console.log(JSON.stringify(res));
  }
});

bot.on('callback_query', async (query) => {
  console.log(`Received message: ${JSON.stringify(query)}`);
  if (!query.message || !query.message.text)
    return;

  const dbKey = `${query.message.chat.id}_${query.message.message_id}`;
  const votes = await readDatastoreEntry(dbKey);
  console.log(`Current votes: ${JSON.stringify(votes)}`);

  // TODO: Check if user already voted
  if (query.data == '+') {
    votes.votesFor.push(query.from.id);
  } else if (query.data == '-') {
    votes.votesAgainst.push(query.from.id);
  } else {
    return;
  }
  console.log(`And now votes are: ${JSON.stringify(votes)}`);
  // TODO: Do it in some transactional way
  await saveDatastoreEntry(dbKey, votes);

  // TODO: Check if vote finished
  await bot.editMessageReplyMarkup(createVoteMarkup(votes), {chat_id: query.message.chat.id, message_id: query.message.message_id});
  await bot.answerCallbackQuery(query.id);
});
