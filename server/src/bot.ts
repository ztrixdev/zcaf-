import { Bot, type Context } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
import { getCustomerByPhone } from "./functions/customer.js";
import { loadJSON } from "./functions/misc.js";
import { QueryResult } from "mysql2";
import axios from 'axios';
import bcrypt from 'bcrypt';

const strings: Record<string, Record<string, any>> = {
    'en': loadJSON('./strings/bot_en.json'),
    'ru': loadJSON('./strings/bot_ru.json'),
};

const settings: Record<string, string> = loadJSON('./settings/bot.json')

const bot: Bot<ConversationFlavor<Context>> = new Bot<ConversationFlavor<Context>>(settings['token']); // <-- put your bot token between the "" (https://t.me/BotFather)
bot.use(conversations());

bot.command('start', async (ctx) => await ctx.reply(`${strings['ru']['welcome']}\n${strings['en']['welcome']}`));

async function bindingCV(cv: Conversation, ctx: Context) {
    await ctx.reply(`${strings['ru']['phone_bind_step']}\n\n${strings['en']['phone_bind_step']}`);
    const phone_ctx = await cv.waitFor("message:text");
    if (phone_ctx.message.text != undefined) {
        if (!isNaN(Number(phone_ctx.message.text))) {
            const customer: QueryResult | null = await getCustomerByPhone(Number(phone_ctx.message.text));
            if (customer == null) {
                await ctx.reply(`${strings['ru']['dianhuahaoma_doesnt_match']}\n\n${strings['en']['dianhuahaoma_doesnt_match']}`);
            } else {
                await ctx.reply(`${strings['ru']['pwd_bind_step']}\n\n${strings['en']['pwd_bind_step']}`);
                const pwd_ctx = await cv.waitFor("message:text");
                const match = await bcrypt.compare(pwd_ctx.message.text, customer[0]['pwd']);
                if (match) {
                    try { 
                        const res = await axios.patch(`${settings['index_ip_addr']}/customer/modifyCustomer`, {
                            'phone': phone_ctx.message.text,
                            'pwd': pwd_ctx.message.text,
                            'type': 'generic',
                            'changes': {'telegram': pwd_ctx.from.id},
                        })
                        if (res.status == 200) {
                            await ctx.reply(`${strings['ru']['bind_200']}\n\n${strings['en']['bind_200']}`);
                            return;
                        } 
                    } catch (err: any) {
                        console.error(err);
                        await ctx.reply(`${strings['ru']['err']}/${strings['en']['err']}`);
                        return;
                    }
                } else {
                    await ctx.reply(`${strings['ru']['pwd_doesnt_match']}\n\n${strings['en']['pwd_doesnt_match']}`);
                    return;
                }
            }
        } else {
            await ctx.reply(`${strings['ru']['NaN_phone']}\n\n${strings['en']['NaN_phone']}`);
            return;
        }
    }
}

bot.use(createConversation(bindingCV));

bot.command('bind', async (ctx) => {
    await ctx.conversation.enter('bindingCV');
})

bot.catch((err) => console.error(err));

export async function notify(type: String, message: String, id: number) {
    if (type == 'pwd') {
        await bot.api.sendMessage(id, `${strings['ru']['password_changed']}\n\n${strings['en']['password_changed']}`);
    } else if (type == 'otc') {
        await bot.api.sendMessage(id, `${strings['ru']['otc']} ${message}\n\n${strings['en']['otc']} ${message}`);
    }
}

export async function initBot() {
    bot.start();
}  
