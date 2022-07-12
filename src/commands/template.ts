import { SlashCommandBuilder } from '@discordjs/builders';

export interface Command {
    command: SlashCommandBuilder;
    execute: Function;
}

export interface Option {
    type: "Attachment" | "Boolean" | "Channel" | "Integer" | "Mention" | "Number" | "Role" | "String" | "User";
    name: string;
    description: string;
    required: boolean;
}

export default function build(name: string, description: string, options: Option[]) {
    let cmd = new SlashCommandBuilder().setName(name).setDescription(description);
    for (let option of options) {
        switch (option.type) {
            case 'Attachment':
                cmd.addAttachmentOption(o =>
                    o.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required));
                break;
            case 'Boolean':
                cmd.addBooleanOption(o =>
                    o.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required));
                break;
            case 'Channel':
                cmd.addChannelOption(o =>
                    o.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required));
                break;
            case 'Integer':
                cmd.addIntegerOption(o =>
                    o.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required));
                break;
            case 'Mention':
                cmd.addMentionableOption(o =>
                    o.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required));
                break;
            case 'Number':
                cmd.addNumberOption(o =>
                    o.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required));
                break;
            case 'Role':
                cmd.addRoleOption(o =>
                    o.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required));
                break;
            case 'String':
                cmd.addStringOption(o =>
                    o.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required));
                break;
            case 'User':
                cmd.addUserOption(o =>
                    o.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required));
                break;
        }
    }
    return cmd;
}
