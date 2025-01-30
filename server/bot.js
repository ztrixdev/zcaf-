import { Bot } from "grammy";
import { assignTelegram, getCustomerByPhone } from "./functions/customer.js";
import { loadJSON } from "./functions/misc.js";

const bot = new Bot(loadJSON('../settings/bot.json').token);
const strings = {
    'en': loadJSON('../strings/bot_en.json'),
    'ru': loadJSON('../strings/bot_ru.json'),
};

bot.command('start', async (ctx) => await ctx.reply(`${strings['ru'].welcome}\n${strings['en'].welcome}`));

bot.command('bind', async (ctx) => {
    const phoneNumber = ctx.match;
    const customer = await getCustomerByPhone(phoneNumber);
    if (customer.length != 0) {
        await assignTelegram(ctx.message.from.id, phoneNumber);
        await ctx.reply(`${strings['ru'].bind_200}\n${strings['en'].bind_200}`);
    } else {
        await ctx.reply(`${strings['ru'].dianhuahaoma_doesnt_match}\n${strings['en'].dianhuahaoma_doesnt_match}`);
    }
})

bot.catch((err) => console.error(err));

export async function sendOTC(id, otc) {
    await bot.api.sendMessage(id, `${strings['ru'].otc} ${otc}\n${strings['en'].otc} ${otc}`);
}

export async function notify(notif, id) {
    if (notif == 'pwd') {
        await bot.api.sendMessage(id, `${strings['ru'].password_changed}\n${strings['en'].password_changed}`);
    }
}

export async function initBot() {
    bot.start();
}  
