import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, Permissions, MessageEmbed } from "discord.js";
import { Logger } from "../../lib/logger";
import { CommandPreprocessor } from "../../lib/preprocessor/commandPreprocessor.js";
import { CooldownDate } from "../../lib/preprocessor/cooldownDate.js";

const owners = [824010269071507536]

export const preprocessorOptions = new CommandPreprocessor({
    cooldown: new CooldownDate({ seconds: 10 }),
    requiredPermissions: [Permissions.FLAGS.SEND_MESSAGES],
    botPermissions: [Permissions.FLAGS.SEND_MESSAGES],
    serverOnly: true,
    saveCooldownInDb: true
})

export const slashCommand = new SlashCommandBuilder()
    .setName('eval')
    .setDescription("Command to execute code")
    .addStringOption(o => o.setName('code').setDescription("Code to be executed").setRequired(true))

export async function execute(i: CommandInteraction, client: Client) {
    if (owners.indexOf(parseInt(i.user.id)) !> 0) return;
    let content = i.options.getString("stmt")
    try {
        let returno = await eval(content);
        const undef = returno === undefined ? "<undefined>" : returno === null ? "<null>" : undefined
        if (returno == undefined) returno = "<undefined>"
        const emb = new MessageEmbed();
        emb.setColor('GREY');
        emb.setTitle("Result");
        emb.setTimestamp();
        if (undef) {
            emb.setDescription(`\`\`\`\n-- None\`\`\``);
        } else {
            if (returno.toString().length > 2000) {
                const trim = returno.toString().slice(0, 1994);
                emb.setDescription(`\`\`\`\n${trim}\`\`\``);
                emb.setFooter("Output trimmed to comply with 2k character limit.");
            }
            else {
                emb.setDescription(`\`\`\`\n${returno}\`\`\``);
            }
        }
        await i.reply({ embeds: [emb] });
    }
    catch (err) {
        const emb = new MessageEmbed();
        emb.setColor('GREY');
        emb.setTitle("Result - Error");
        emb.setTimestamp();
        if (err.stack.length > 2000) {
            const trim = err.slice(0, 1994);
            emb.setDescription(`\`\`\`\n${trim}\`\`\``);
            emb.setFooter("Exception trimmed to comply with 2k character limit.");
        }
        else {
            emb.setDescription(`\`\`\`\n${err.stack}\`\`\``);
        }
        await i.reply({ embeds: [emb] });
    }
}